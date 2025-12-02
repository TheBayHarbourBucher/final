fetch("data/foods.json")
  .then(res => res.json())
  .then(data => {
    displayFoods(data);
  });

  function displayFoods(meals) {
  const container = document.getElementById("the_foods");
  container.innerHTML = "";

  meals.forEach(meal => {
    const card = document.createElement("article");
    card.classList.add("foodcard");

    card.innerHTML = `
      <img src="${meal.image}" class="foodpic">
      <div class="foodstuff">
        <div class="foodheader">
          <h2 class="food-title">${meal.name}</h2>
          <p>${meal.rating}</p>
          <button class="heart">♡</button>
        </div>
        <p class="fooddisc">${meal.description || "Tasty food!"}</p>
      </div>
    `;

    // When clicked → go to details page
    card.onclick = () => {
      localStorage.setItem("selectedMeal", meal.id);
      window.location.href = "disc.html";
    };

    container.appendChild(card);
  });
}