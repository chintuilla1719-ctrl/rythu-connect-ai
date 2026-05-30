function recommendCrop() {

    let soil = document.getElementById("soil").value.toLowerCase();

    let crop = "";

    if (soil.includes("black")) {
        crop = "Cotton";
    }
    else if (soil.includes("red")) {
        crop = "Groundnut";
    }
    else if (soil.includes("alluvial")) {
        crop = "Rice";
    }
    else {
        crop = "Maize";
    }

    document.getElementById("result").innerHTML =
        "Recommended Crop: " + crop;
}