"use client";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  gap: 3,
};

const style2 = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 700,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  gap: 3,
  overflow: "auto",
  whiteSpace: "pre-wrap",
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [recipe, setRecipe] = useState(false);
  const [formattedRecipe, setFormattedRecipe] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [alert, setAlert] = useState(false);
  const [search, setSearch] = useState("");

  const [itemName, setItemName] = useState("");

  const recipeOpen = () => setRecipe(true);
  const recipeClose = () => {
    setRecipe(false);
    setFormattedRecipe(null);
  };

  const apiKey =
    "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";

  const getRecipe = async () => {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct:free",
            messages: [
              {
                role: "user",
                content: `Generate a recipe based on these ingredients: ${pantry
                  .map((item) => item.name + ": " + item.quantity)
                  .join(", ")}`,
              },
            ],
          }),
        }
      );
      if (!response.ok) {
        console.log("HTTP error! status: ", response.status);
      }

      const data = await response.json();
      console.log(data);
      formatRecipe(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatRecipe = (data) => {
    const content = data.choices[0].message.content;
    const recipe = content.split("**");
    const text = recipe.join("\n");
    setFormattedRecipe(text);
    console.log(text);
  };

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    console.log(pantryList);
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePantry();
  };

  const filteredPantry = pantry.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.quantity.toString().includes(search)
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
    >
      <AppBar position="fixed" sx={{ height: 80 }}>
        <Toolbar sx={{ height: 1, display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          ></IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            <strong>MyPantry</strong>
          </Typography>
        </Toolbar>
      </AppBar>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                setAlert(false);
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (itemName.trim() !== "") {
                  addItem(itemName.charAt(0).toUpperCase() + itemName.slice(1));
                  setItemName("");
                  handleClose();
                  setAlert(false);
                } else {
                  setAlert(true);
                }
              }}
            >
              Add
            </Button>
          </Stack>
          {alert && <Typography>Please enter an item</Typography>}
        </Box>
      </Modal>
      <Modal open={recipe} onClose={recipeClose}>
        <Box sx={style2}>
          <Typography sx={{ lineHeight: 1.1, m: 0, p: 0 }}>
            {formattedRecipe ? (
              formattedRecipe
            ) : (
              <Typography>
                <strong>Loading...</strong>
              </Typography>
            )}
          </Typography>
        </Box>
      </Modal>
      <Stack direction={"row"} spacing={5} marginTop={"100px"}>
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            recipeOpen();
            getRecipe();
          }}
        >
          Find a recipe
        </Button>
      </Stack>
      <Box border={"1px solid #333"}>
        <Box
          width="800px"
          height="80px"
          bgcolor={"#ADD8E6"}
          justifyContent={"space-between"}
          display={"flex"}
          alignItems={"center"}
          border={"1px solid #333"}
          padding={"0px 10px"}
        >
          <Typography variant={"h2"} color={"#333"}>
            <strong>Pantry Items</strong>
          </Typography>
          <TextField
            id="outlined-basic"
            label="Search Item"
            variant="outlined"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </Box>
        <Stack width="800px" height="482px" spacing={2} overflow={"auto"}>
          {filteredPantry.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              bgcolor={"#f0f0f0"}
              padding="10px"
            >
              <Typography
                variant={"h3"}
                color={"#333"}
                textAlign={"center"}
                fontweight={"bold"}
              >
                {name}
              </Typography>
              <Typography variant="h3" color="#333" textAlign="center">
                {quantity}
              </Typography>
              <Stack direction={"row"} spacing={1}>
                <Button variant="contained" onClick={() => addItem(name)}>
                  Add
                </Button>
                <Button variant="contained" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
