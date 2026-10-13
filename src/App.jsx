
import { useEffect, useState } from "react";
import { pipeline } from "@huggingface/transformers";
import "./App.css";

const features = [
  {
    icon: "🥗",
    number: "01 / DISCOVER",
    title: "Know Your Food",
    description:
      "Start with a clear photo of one food item or one type of food, then explore your food journey.",
    style: "card-green",
    iconStyle: "icon-green",
    decoration: "🥦",
  },
  {
    icon: "🍎",
    number: "02 / UNDERSTAND",
    title: "Explore Nutrition",
    description: "Discover simple information about calories and nutrients.",
    style: "card-yellow",
    iconStyle: "icon-yellow",
    decoration: "🍊",
  },
  {
    icon: "💚",
    number: "03 / IMPROVE",
    title: "Build Better Habits",
    description:
      "Build confidence with small, mindful steps towards your everyday food choices.",
    style: "card-red",
    iconStyle: "icon-red",
    decoration: "🥑",
  },
];

const FOOD_LABELS = [
  // Fruits
  "apple", "banana", "orange", "mango", "grapes", "watermelon",
  "pineapple", "papaya", "strawberry", "kiwi", "dragon fruit",
  "pear", "peach", "pomegranate", "guava", "cherries",
  "blueberries", "lemon",

  // Vegetables
  "carrot", "tomato", "potato", "onion", "cucumber", "spinach",
  "broccoli", "cauliflower", "cabbage", "brinjal", "okra",
  "green peas", "green beans", "bell pepper", "beetroot",
  "sweet potato", "corn", "lettuce",

  // South Indian food
  "plain crispy dosa", "masala dosa", "onion dosa", "rava dosa",
  "plain idli", "idli with sambar", "idli with coconut chutney",
  "medu vada", "uttapam", "upma", "poha", "pesarattu", "pongal",
  "lemon rice", "vegetable biryani", "chicken biryani",
  "tomato rice", "sambar", "tomato chutney", "rasam",

  // Indian meals
  "plain steamed rice", "chapati", "roti", "naan", "paratha",
  "dal", "paneer butter masala", "palak paneer", "chole masala",
  "rajma curry", "potato curry", "vegetable curry", "chicken curry",
  "fish curry", "egg curry", "fried rice", "vegetable pulao",
  "khichdi",

  // Snacks
  "pani puri", "samosa", "pakora", "kachori", "bhel puri",
  "pav bhaji", "vada pav", "dahi puri", "aloo tikki",
  "spring rolls", "french fries", "pizza", "burger", "sandwich",
  "noodles", "pasta",

  // Protein
  "boiled egg", "omelette", "grilled chicken", "fried chicken",
  "grilled fish", "tofu", "boiled chickpeas", "boiled kidney beans",
  "peanuts", "almonds", "cashews", "walnuts",

  // Dairy and desserts
  "milk", "curd", "yogurt", "paneer", "cheese", "butter",
  "ice cream", "chocolate cake", "vanilla cake", "gulab jamun",
  "jalebi", "laddu", "brownie", "doughnut", "pudding",

  // Drinks
  "water", "orange juice", "apple juice", "mango juice",
  "banana milkshake", "mango milkshake", "chocolate milkshake",
  "lassi", "buttermilk", "tea", "coffee",

  // Non-food candidates
  "a person", "a pet animal", "a flower", "a phone", "a book",
  "a shoe", "an empty plate", "an empty bowl", "a landscape",
  "a non-food object",
];

const SOUTH_INDIAN_FOODS = new Set([
  "plain crispy dosa", "masala dosa", "onion dosa", "rava dosa",
  "plain idli", "idli with sambar", "idli with coconut chutney",
  "medu vada", "uttapam", "upma", "poha", "pesarattu", "pongal",
  "lemon rice", "vegetable biryani", "chicken biryani",
  "tomato rice", "sambar", "tomato chutney", "rasam",
]);

const FRUITS = new Set([
  "apple", "banana", "orange", "mango", "grapes", "watermelon",
  "pineapple", "papaya", "strawberry", "kiwi", "dragon fruit",
  "pear", "peach", "pomegranate", "guava", "cherries",
  "blueberries", "lemon",
]);

const VEGETABLES = new Set([
  "carrot", "tomato", "potato", "onion", "cucumber", "spinach",
  "broccoli", "cauliflower", "cabbage", "brinjal", "okra",
  "green peas", "green beans", "bell pepper", "beetroot",
  "sweet potato", "corn", "lettuce",
]);

const NON_FOOD_LABELS = new Set([
  "a person", "a pet animal", "a flower", "a phone", "a book",
  "a shoe", "an empty plate", "an empty bowl", "a landscape",
  "a non-food object",
]);

// Detailed prompts help distinguish foods with similar appearances.
function makeFoodPrompt(label) {
  const specificPrompts = {
    "plain crispy dosa":
      "a close-up photo of a large thin golden-brown crispy South Indian dosa, a flat round rice and lentil crepe on a plate",
    "masala dosa":
      "a photo of a golden South Indian masala dosa, a folded crispy crepe filled with spiced mashed potato",
    "onion dosa":
      "a photo of South Indian onion dosa, a flat savory crepe topped with chopped onions",
    "rava dosa":
      "a photo of crispy South Indian rava dosa, a thin lacy crepe with many small holes and a crunchy texture",
    "pani puri":
      "a photo of Indian pani puri, several small round hollow crispy golden puris filled with potato and served with spicy green flavored water",
    "dahi puri":
      "a photo of Indian dahi puri, small hollow crispy puris topped with white yogurt, chutneys and sev",
    "bhel puri":
      "a photo of Indian bhel puri, puffed rice mixed with chopped onion, chutneys and crunchy sev",
    "plain idli":
      "a photo of white soft round steamed South Indian idli rice cakes on a plate",
    "idli with sambar":
      "a photo of white round steamed idli rice cakes beside a bowl of orange South Indian lentil sambar",
    "idli with coconut chutney":
      "a photo of white steamed idli rice cakes served with white coconut chutney",
    "medu vada":
      "a photo of South Indian medu vada, golden fried ring-shaped lentil fritters with a hole in the middle",
    "samosa":
      "a photo of triangular golden fried Indian samosas with a crisp pastry shell",
    "chapati":
      "a photo of flat round Indian chapati bread, thin and lightly browned",
    "plain steamed rice":
      "a photo of a bowl of plain cooked white steamed rice grains",
    "vegetable biryani":
      "a photo of Indian vegetable biryani, seasoned long-grain rice mixed with visible vegetables and spices",
    "chicken biryani":
      "a photo of Indian chicken biryani, seasoned long-grain rice served with visible pieces of cooked chicken",
    "vegetable pulao":
      "a photo of vegetable pulao, lightly spiced rice mixed with peas, carrots and vegetables",
    "fried rice":
      "a photo of cooked fried rice with visible rice grains, vegetables and seasoning",
    "pizza":
      "a photo of a round pizza topped with melted cheese and other toppings",
    "burger":
      "a photo of a burger with a bun, filling and toppings",
    "french fries":
      "a photo of thin golden potato fries served in a pile",
    "plain crispy dosa":
      "a close-up photo of a large thin golden-brown crispy South Indian dosa, a flat round rice and lentil crepe on a plate",
  };

  if (specificPrompts[label]) return specificPrompts[label];

  if (FRUITS.has(label)) {
    return `a clear photograph of a fresh ${label} fruit, whole or sliced`;
  }

  if (VEGETABLES.has(label)) {
    return `a clear photograph of a fresh ${label} vegetable`;
  }

  if (SOUTH_INDIAN_FOODS.has(label)) {
    return `a photograph of ${label}, an authentic South Indian dish served ready to eat`;
  }

  if (NON_FOOD_LABELS.has(label)) {
    return `a photograph of ${label.replace(/^a /, "")}, a non-food subject`;
  }

  return `a photograph of ${label}, showing the food or drink itself`;
}

const FOOD_PROMPTS = FOOD_LABELS.map(makeFoodPrompt);

let classifierPromise = null;

async function getFoodClassifier() {
  if (!classifierPromise) {
    classifierPromise = pipeline(
      "zero-shot-image-classification",
      "Xenova/clip-vit-base-patch32"
    ).catch((error) => {
      classifierPromise = null;
      throw error;
    });
  }

  return classifierPromise;
}

// Approximate reference nutrition per 100 g; drinks per 100 ml.
const makeNutrition = (calories, carbs, protein, fat, fiber) => ({
  calories: `${calories} kcal`,
  carbs: `${carbs} g`,
  protein: `${protein} g`,
  fat: `${fat} g`,
  fiber: `${fiber} g`,
});

const nutritionProfiles = {
  // Fruits
  apple: makeNutrition(52, 13.8, 0.3, 0.2, 2.4),
  banana: makeNutrition(89, 22.8, 1.1, 0.3, 2.6),
  orange: makeNutrition(47, 11.8, 0.9, 0.1, 2.4),
  mango: makeNutrition(60, 15, 0.8, 0.4, 1.6),
  grapes: makeNutrition(69, 18.1, 0.7, 0.2, 0.9),
  watermelon: makeNutrition(30, 7.6, 0.6, 0.2, 0.4),
  pineapple: makeNutrition(50, 13.1, 0.5, 0.1, 1.4),
  papaya: makeNutrition(43, 10.8, 0.5, 0.3, 1.7),
  strawberry: makeNutrition(32, 7.7, 0.7, 0.3, 2),
  kiwi: makeNutrition(61, 14.7, 1.1, 0.5, 3),
  "dragon fruit": makeNutrition(57, 13, 1.2, 0, 3.1),
  pear: makeNutrition(57, 15.2, 0.4, 0.1, 3.1),
  peach: makeNutrition(39, 9.5, 0.9, 0.3, 1.5),
  pomegranate: makeNutrition(83, 18.7, 1.7, 1.2, 4),
  guava: makeNutrition(68, 14.3, 2.6, 1, 5.4),
  cherries: makeNutrition(63, 16, 1.1, 0.2, 2.1),
  blueberries: makeNutrition(57, 14.5, 0.7, 0.3, 2.4),
  lemon: makeNutrition(29, 9.3, 1.1, 0.3, 2.8),

  // Vegetables
  carrot: makeNutrition(41, 9.6, 0.9, 0.2, 2.8),
  tomato: makeNutrition(18, 3.9, 0.9, 0.2, 1.2),
  potato: makeNutrition(87, 20.1, 1.9, 0.1, 1.8),
  onion: makeNutrition(40, 9.3, 1.1, 0.1, 1.7),
  cucumber: makeNutrition(15, 3.6, 0.7, 0.1, 0.5),
  spinach: makeNutrition(23, 3.6, 2.9, 0.4, 2.2),
  broccoli: makeNutrition(34, 6.6, 2.8, 0.4, 2.6),
  cauliflower: makeNutrition(25, 5, 1.9, 0.3, 2),
  cabbage: makeNutrition(25, 5.8, 1.3, 0.1, 2.5),
  brinjal: makeNutrition(25, 5.9, 1, 0.2, 3),
  okra: makeNutrition(33, 7.5, 1.9, 0.2, 3.2),
  "green peas": makeNutrition(81, 14.5, 5.4, 0.4, 5.1),
  "green beans": makeNutrition(31, 7, 1.8, 0.2, 3.4),
  "bell pepper": makeNutrition(31, 6, 1, 0.3, 2.1),
  beetroot: makeNutrition(43, 9.6, 1.6, 0.2, 2.8),
  "sweet potato": makeNutrition(86, 20.1, 1.6, 0.1, 3),
  corn: makeNutrition(96, 21, 3.4, 1.5, 2.4),
  lettuce: makeNutrition(15, 2.9, 1.4, 0.2, 1.3),

  // South Indian food
  dosa: makeNutrition(168, 29, 4, 3.7, 1.5),
  "masala dosa": makeNutrition(220, 33, 5, 7, 3),
  "onion dosa": makeNutrition(175, 29, 4, 4, 2),
  "rava dosa": makeNutrition(184, 27, 4, 6, 2),
  idly: makeNutrition(146, 30, 4, 0.5, 1.5),
  "medu vada": makeNutrition(280, 30, 8, 14, 4),
  uttapam: makeNutrition(160, 25, 4, 4, 2),
  upma: makeNutrition(150, 25, 4, 4, 3),
  poha: makeNutrition(130, 25, 2.5, 3, 2),
  pesarattu: makeNutrition(150, 22, 7, 4, 4),
  pongal: makeNutrition(160, 25, 4, 5, 2),
  "lemon rice": makeNutrition(175, 28, 3, 5, 1),
  "vegetable biryani": makeNutrition(160, 25, 4, 5, 2),
  "chicken biryani": makeNutrition(180, 22, 9, 6, 1.5),
  "tomato rice": makeNutrition(150, 25, 3, 4, 2),
  sambar: makeNutrition(65, 9, 3, 2, 3),
  "tomato chutney": makeNutrition(100, 10, 2, 6, 2),
  rasam: makeNutrition(30, 4, 1.5, 1, 1),

  // Indian meals
  "plain steamed rice": makeNutrition(130, 28, 2.7, 0.3, 0.4),
  chapati: makeNutrition(297, 46, 9, 8, 7),
  naan: makeNutrition(290, 48, 9, 5, 2),
  paratha: makeNutrition(300, 45, 7, 10, 4),
  dal: makeNutrition(116, 20, 9, 0.4, 8),
  "paneer butter masala": makeNutrition(220, 8, 8, 17, 2),
  "palak paneer": makeNutrition(170, 8, 9, 12, 3),
  "chole masala": makeNutrition(150, 22, 7, 4, 6),
  "rajma curry": makeNutrition(127, 22, 8.7, 0.5, 6.4),
  "potato curry": makeNutrition(120, 18, 2.5, 4, 3),
  "vegetable curry": makeNutrition(100, 12, 3, 4, 4),
  "chicken curry": makeNutrition(160, 5, 16, 8, 1),
  "fish curry": makeNutrition(140, 5, 18, 6, 1),
  "egg curry": makeNutrition(150, 5, 10, 9, 1),
  "fried rice": makeNutrition(180, 29, 4, 6, 2),
  khichdi: makeNutrition(120, 20, 4, 3, 3),

  // Snacks
  "pani puri": makeNutrition(220, 30, 5, 9, 3),
  samosa: makeNutrition(260, 30, 5, 13, 3),
  pakora: makeNutrition(280, 30, 6, 15, 4),
  kachori: makeNutrition(300, 35, 6, 16, 3),
  "bhel puri": makeNutrition(150, 25, 4, 4, 3),
  "pav bhaji": makeNutrition(180, 25, 4, 7, 4),
  "vada pav": makeNutrition(290, 40, 7, 11, 4),
  "dahi puri": makeNutrition(200, 28, 5, 8, 3),
  "aloo tikki": makeNutrition(180, 25, 3, 8, 3),
  "spring rolls": makeNutrition(200, 25, 4, 9, 2),
  "french fries": makeNutrition(312, 41, 3.4, 15, 3.8),
  pizza: makeNutrition(266, 33, 11, 10, 2.3),
  burger: makeNutrition(250, 30, 12, 9, 2),
  sandwich: makeNutrition(250, 30, 10, 10, 3),
  noodles: makeNutrition(150, 25, 5, 4, 2),
  pasta: makeNutrition(157, 31, 5.8, 0.9, 1.8),

  // Protein
  "boiled egg": makeNutrition(155, 1.1, 13, 11, 0),
  omelette: makeNutrition(154, 1.2, 11, 11, 0),
  "grilled chicken": makeNutrition(165, 0, 31, 3.6, 0),
  "fried chicken": makeNutrition(260, 9, 25, 14, 1),
  "grilled fish": makeNutrition(140, 0, 24, 4, 0),
  tofu: makeNutrition(76, 1.9, 8, 4.8, 0.3),
  "boiled chickpeas": makeNutrition(164, 27.4, 8.9, 2.6, 7.6),
  "boiled kidney beans": makeNutrition(127, 22.8, 8.7, 0.5, 6.4),
  peanuts: makeNutrition(567, 16.1, 25.8, 49.2, 8.5),
  almonds: makeNutrition(579, 21.6, 21.2, 49.9, 12.5),
  cashews: makeNutrition(553, 30.2, 18.2, 43.9, 3.3),
  walnuts: makeNutrition(654, 13.7, 15.2, 65.2, 6.7),

  // Dairy and desserts
  milk: makeNutrition(61, 4.8, 3.2, 3.3, 0),
  curd: makeNutrition(61, 4.7, 3.5, 3.3, 0),
  yogurt: makeNutrition(61, 4.7, 3.5, 3.3, 0),
  paneer: makeNutrition(265, 1.2, 18.3, 20.8, 0),
  cheese: makeNutrition(402, 1.3, 25, 33, 0),
  butter: makeNutrition(717, 0.1, 0.9, 81, 0),
  "ice cream": makeNutrition(207, 24, 3.5, 11, 0.7),
  "chocolate cake": makeNutrition(370, 50, 5, 17, 2),
  "vanilla cake": makeNutrition(350, 50, 5, 15, 1),
  "gulab jamun": makeNutrition(350, 55, 5, 12, 0.5),
  jalebi: makeNutrition(400, 65, 3, 15, 1),
  laddu: makeNutrition(400, 55, 7, 18, 3),
  brownie: makeNutrition(405, 50, 5, 20, 3),
  doughnut: makeNutrition(400, 45, 5, 22, 2),
  pudding: makeNutrition(120, 20, 3, 3, 0),

  // Drinks
  water: makeNutrition(0, 0, 0, 0, 0),
  "orange juice": makeNutrition(45, 10.4, 0.7, 0.2, 0.2),
  "apple juice": makeNutrition(46, 11.3, 0.1, 0.1, 0.2),
  "mango juice": makeNutrition(60, 15, 0.5, 0.1, 0.5),
  "banana milkshake": makeNutrition(105, 17, 4, 3, 1),
  "mango milkshake": makeNutrition(110, 17, 3.5, 3.5, 1),
  "chocolate milkshake": makeNutrition(120, 18, 4, 4, 1),
  lassi: makeNutrition(75, 10, 3, 2.5, 0),
  buttermilk: makeNutrition(40, 5, 3, 1, 0),
  tea: makeNutrition(30, 5, 1, 1, 0),
  coffee: makeNutrition(2, 0, 0.3, 0, 0),
};

const nutritionAliases = {
  "plain crispy dosa": "dosa",
  "plain idli": "idly",
  "idli with sambar": "idly",
  "idli with coconut chutney": "idly",
  "plain steamed rice": "plain steamed rice",
  rice: "plain steamed rice",
  roti: "chapati",
  "vegetable pulao": "vegetable biryani",
  egg: "boiled egg",
};

function normalizeFoodLabel(label) {
  return String(label ?? "")
    .toLowerCase()
    .trim()
    .replace(/^a photo of\s+/, "")
    .replace(/^a picture of\s+/, "")
    .replace(/^a plate of\s+/, "")
    .replace(/^a bowl of\s+/, "")
    .replace(/^a fresh\s+/, "")
    .replace(/^an?\s+/, "")
    .replace(/[.!?]+$/, "")
    .trim();
}

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("fruit");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return undefined;
    }

    const imageUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(imageUrl);
    return () => URL.revokeObjectURL(imageUrl);
  }, [selectedImage]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file such as JPG or PNG.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image under 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  }

  function removeImage() {
    setSelectedImage(null);
    setResult(null);
    setError("");

    const input = document.getElementById("food-image");
    if (input) input.value = "";
  }

  async function handleAnalyzeFood() {
    if (!selectedImage) {
      setError("Choose a food picture before continuing.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const classifier = await getFoodClassifier();

      // Compare all categories using descriptive prompts.
      const predictions = await classifier(selectedImage, FOOD_PROMPTS);

      if (!predictions?.length) {
        throw new Error("No prediction was returned. Please try again.");
      }

      console.table(
        predictions.slice(0, 10).map((item) => ({
          prompt: item.label,
          score: `${(item.score * 100).toFixed(2)}%`,
        }))
      );

      // Convert the winning prompt back to its canonical food label.
      const bestPrediction = predictions[0];
      const candidateIndex = FOOD_PROMPTS.indexOf(bestPrediction.label);

      if (candidateIndex === -1) {
        throw new Error("Unexpected model output. Please try another image.");
      }

      const foodLabel = FOOD_LABELS[candidateIndex];
      const normalizedLabel = normalizeFoodLabel(foodLabel);
      const score = bestPrediction.score;

      console.log("Predicted food:", normalizedLabel);
      console.log("Model similarity score:", score);
      console.log("Selected category:", selectedCategory);

      if (NON_FOOD_LABELS.has(foodLabel)) {
        setError(
          "The model did not find a supported food item. Try a clear photo of one food item."
        );
        return;
      }

      const nutritionKey =
        nutritionAliases[normalizedLabel] || normalizedLabel;

      const nutrition = nutritionProfiles[nutritionKey] || null;

      setResult({
        fileName: selectedImage.name,
        foodLabel: normalizedLabel,
        score,
        nutrition,
      });
    } catch (err) {
      console.error("Food analysis failed:", err);
      setError(
        err?.message ||
          "Something went wrong while analyzing your image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nutri-app">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="NutriLens home">
          <span className="brand-icon">🥑</span>
          <span>
            Nutri<span className="brand-highlight">Lens</span>
          </span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#features">What You Get</a>
          <a href="#scanner">Try It</a>
          <a href="#about">About Us</a>
        </nav>

        <a className="nav-button" href="#scanner">
          Explore Your Food <span>↗</span>
        </a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-sparkle">✦</span>
              YOUR LITTLE FOOD COMPANION
            </div>

            <h1>
              Eat Better.
              <br />
              Feel <span className="green-word">Brighter.</span>
            </h1>

            <p className="hero-description">
              Curious about what is on your plate? NutriLens makes exploring
              food and nutrition simple, friendly, and fun.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#scanner">
                Explore Your Meal <span>→</span>
              </a>
              <a className="secondary-button" href="#features">
                Discover More <span>↗</span>
              </a>
            </div>

            <p className="hero-note">
              <span>🌿</span> Small food choices can make a big difference.
            </p>
          </div>

          <div className="hero-art" aria-label="Illustration of fresh vegetables">
            <div className="art-sun" />
            <div className="art-circle art-circle-one" />
            <div className="art-circle art-circle-two" />
            <div className="food-plate">
              <div className="plate-inner">
                <span className="food food-broccoli">🥦</span>
                <span className="food food-carrot">🥕</span>
                <span className="food food-tomato">🍅</span>
                <span className="food food-avocado">🥑</span>
                <span className="food food-corn">🌽</span>
                <span className="food food-leaf">🌿</span>
                <span className="food food-pepper">🫑</span>
              </div>
            </div>
            <div className="art-label art-label-top">🥕 Fresh choices</div>
            <div className="art-label art-label-bottom">
              💚 Good food, good mood
            </div>
            <span className="floating-star star-one">✦</span>
            <span className="floating-star star-two">✳</span>
            <span className="floating-star star-three">✦</span>
            <span className="floating-heart">♥</span>
          </div>
        </section>

        <div className="ticker" aria-label="NutriLens highlights">
          <span>FRESH IDEAS</span>
          <span className="ticker-dot">✦</span>
          <span>BETTER FOOD CHOICES</span>
          <span className="ticker-dot">✦</span>
          <span>HAPPIER HABITS</span>
          <span className="ticker-dot">✦</span>
          <span>YOUR WELLNESS JOURNEY</span>
        </div>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="section-eyebrow">A LITTLE GOODNESS FOR YOU</span>
            <h2>
              Food made
              <br />
              <span className="green-word">easy to understand.</span>
            </h2>
            <p>
              A simple place to discover your food, learn something new, and
              feel more confident about your everyday choices.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article
                className={`feature-card ${feature.style}`}
                key={feature.number}
              >
                <div className={`feature-icon ${feature.iconStyle}`}>
                  {feature.icon}
                </div>
                <span className="feature-number">{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="card-decoration" aria-hidden="true">
                  {feature.decoration}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="scanner-section" id="scanner">
          <span className="scanner-decoration scanner-decoration-one">✦</span>
          <span className="scanner-decoration scanner-decoration-two">🌿</span>

          <div className="scanner-heading">
            <span className="scanner-eyebrow">LET'S GET STARTED</span>
            <h2>
              What's
              <br />
              <span>on your plate?</span>
            </h2>
            <p>
              Pick a picture of your meal and start your food journey. It's
              quick, easy, and just a few clicks away.
            </p>
            <div className="scanner-points">
              <p><span>✓</span> Easy picture upload</p>
              <p><span>✓</span> Friendly and simple to use</p>
              <p><span>✓</span> A fresh start towards mindful eating</p>
            </div>
          </div>

          <div className="upload-card">
            <div className="upload-card-heading">
              <div>
                <span className="upload-mini-label">YOUR FOOD, YOUR STORY</span>
                <h3>Let's take a look!</h3>
              </div>
              <div className="upload-emoji" aria-hidden="true">📸</div>
            </div>

            <div style={{ margin: "18px 0 14px", textAlign: "left" }}>
              <label
                htmlFor="food-category"
                style={{ display: "block", fontWeight: 700, marginBottom: 8 }}
              >
                Which food category best matches your picture?
              </label>
              <select
                id="food-category"
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setResult(null);
                  setError("");
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #D8E3CE",
                  borderRadius: 12,
                  background: "#FFFFFF",
                  color: "#252D20",
                  font: "inherit",
                  cursor: "pointer",
                }}
              >
                <option value="fruit">🍎 Fruits</option>
                <option value="vegetables">🥕 Vegetables</option>
                <option value="grains">🍚 Grains and cereals</option>
                <option value="protein">🥚 Protein-rich foods</option>
                <option value="dairy">🥛 Dairy</option>
                <option value="snacks">🍿 Snacks</option>
              </select>
              <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, color: "#5F6356" }}>
                All supported categories are compared automatically. Your
                selected category does not restrict or guarantee the result.
              </p>
            </div>

            <div className="upload-zone">
              {!previewUrl ? (
                <div className="empty-upload">
                  <div className="upload-illustration">
                    <span className="upload-bowl">🥗</span>
                    <span className="upload-sparkle">✦</span>
                  </div>
                  <h4>Show us your food!</h4>
                  <p>
                    Upload a clear photo of one food item or one type of food.
                    Mixed meals may be harder to identify.
                  </p>
                  <label className="file-picker-label" htmlFor="food-image">
                    <span>＋</span> Choose a food picture
                  </label>
                </div>
              ) : (
                <div className="preview-container">
                  <img
                    src={previewUrl}
                    alt="Preview of your selected meal"
                    className="image-preview"
                  />
                  <div className="preview-details">
                    <span className="preview-file-icon">🖼️</span>
                    <div className="preview-file-info">
                      <strong>{selectedImage?.name}</strong>
                      <span>
                        {selectedImage
                          ? `${(selectedImage.size / 1024).toFixed(1)} KB`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <button
                    className="remove-button"
                    type="button"
                    onClick={removeImage}
                    disabled={loading}
                  >
                    Remove picture
                  </button>
                </div>
              )}

              <input
                className="file-input"
                id="food-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
              <p className="file-hint">
                JPG or PNG recommended · Maximum size: 5 MB
              </p>
            </div>

            <button
              className="analyze-button"
              type="button"
              onClick={handleAnalyzeFood}
              disabled={!selectedImage || loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Analyzing your food...
                </>
              ) : (
                <>ANALYZE<span>→</span></>
              )}
            </button>

            {error && (
              <div className="status-message error-message" role="alert">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div style={{ marginTop: 24, textAlign: "left" }} role="status">
                <section
                  aria-labelledby="nutrition-demo-title"
                  style={{
                    border: "1px solid #DDE8D3",
                    borderRadius: 18,
                    padding: 20,
                    background: "#F8FBF4",
                    color: "#252D20",
                  }}
                >
                  <div style={{ fontSize: 32 }} aria-hidden="true">
                    {result.nutrition ? "🥗" : "🔎"}
                  </div>

                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: "#4F7D32",
                      marginBottom: 5,
                    }}
                  >
                    AI IMAGE CLASSIFICATION
                  </span>

                  <h3
                    id="nutrition-demo-title"
                    style={{ margin: "0 0 8px", fontSize: 22 }}
                  >
                    Predicted food: {result.foodLabel}
                  </h3>

                  <p style={{ margin: "0 0 12px", lineHeight: 1.6 }}>
                    Model similarity score: {(result.score * 100).toFixed(1)}%
                  </p>

                  <p style={{ fontSize: 13, color: "#5F6356", lineHeight: 1.6 }}>
                    This is a relative match score, not a verified probability.
                    AI predictions can be incorrect. Check that the prediction
                    matches your image.
                  </p>

                  {result.nutrition ? (
                    <>
                      <h4 style={{ marginTop: 22, marginBottom: 6 }}>
                        Approximate nutrition per 100 g
                      </h4>
                      <p style={{ fontSize: 13, color: "#5F6356" }}>
                        Reference values for {result.foodLabel}, not measurements
                        from your image. Actual nutrition varies with ingredients
                        and preparation.
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
                          gap: 10,
                        }}
                      >
                        {[
                          { label: "Calories", value: result.nutrition.calories, icon: "🔥" },
                          { label: "Carbohydrates", value: result.nutrition.carbs, icon: "🌾" },
                          { label: "Protein", value: result.nutrition.protein, icon: "💪" },
                          { label: "Fat", value: result.nutrition.fat, icon: "🥑" },
                          { label: "Fiber", value: result.nutrition.fiber, icon: "🌿" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid #E8E7D8",
                              borderRadius: 12,
                              padding: "13px 12px",
                            }}
                          >
                            <div style={{ fontSize: 18, marginBottom: 5 }} aria-hidden="true">
                              {item.icon}
                            </div>
                            <div style={{ fontSize: 12, color: "#5F6356", marginBottom: 4 }}>
                              {item.label}
                            </div>
                            <strong style={{ fontSize: 18 }}>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{ marginTop: 16, lineHeight: 1.6 }}>
                      No nutrition reference values are available for this
                      prediction yet. No nutrition values have been invented.
                    </p>
                  )}

                  <p className="result-filename" style={{ marginTop: 16 }}>
                    Uploaded image: {result.fileName}
                  </p>
                </section>
              </div>
            )}

            <p className="privacy-note">
              Your picture is used for this demo experience. Please avoid
              uploading personal or sensitive images.
            </p>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-illustration">
            <div className="about-food">🥑</div>
            <span className="about-sparkle">✦</span>
            <span className="about-leaf">🌿</span>
          </div>

          <div className="about-content">
            <span className="section-eyebrow">A HEALTHIER WAY TO EXPLORE</span>
            <h2>
              Better choices
              <br />
              start with <span className="green-word">curiosity.</span>
            </h2>
            <p>
              NutriLens is designed to make learning about food feel less
              complicated and more enjoyable. Explore your meals, discover
              new things, and take your wellness journey one step at a time.
            </p>
            <a className="about-link" href="#scanner">
              Start Exploring <span>→</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-brand" href="#home">
          🥑 Nutri<span className="brand-highlight">Lens</span>
        </a>
        <p>Made with care, for a happier relationship with food. 💚</p>
        <a className="back-to-top" href="#home">Back to top ↑</a>
      </footer>
    </div>
  );
}

export default App;
