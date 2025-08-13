const colorinput = document.getElementById("colorPicker")
const colorscheme = document.getElementById("color-scheme")
const getschemebtn = document.getElementById("get-scheme")
const colorgrid = document.getElementById("colorgrid")
const loading = document.getElementById("loading")
const error = document.getElementById("error")

function displayLoading() {
    loading.style.display = "block"
    error.style.display = "none"
    colorgrid.innerHTML = ""
}

function hideLoading() {
    loading.style.display = "none"
}

function displayError() {
    error.style.display = "block"
    hideLoading();
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Missing function - added this
function getContrastColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#000000';
    
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

function createColorColumn(colorData) {
    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.height = "100%";

    const colorBox = document.createElement("div");
    colorBox.style.backgroundColor = colorData.hex.value;
    colorBox.style.flex = "1";
    colorBox.style.minHeight = "500px";
    colorBox.style.width = "100px";
    colorBox.style.cursor = "pointer";
    colorBox.style.transition = "transform 0.3s ease";
    colorBox.style.borderRadius = "8px";
    colorBox.style.border = `2px solidd ${colorData.hex.value}`;

    // Add hover effects
    colorBox.addEventListener('mouseenter', () => {
        colorBox.style.transform = 'scale(1.05)';
    });
    
    colorBox.addEventListener('mouseleave', () => {
        colorBox.style.transform = 'scale(1)';
    });
    
    // Click to copy hex value
    colorBox.addEventListener('click', () => {
        navigator.clipboard.writeText(colorData.hex.value).then(() => {
            const originalBorder = colorBox.style.border;
            
            // Create copied alert
            const copiedAlert = document.createElement("div");
            copiedAlert.innerHTML = `Copied ${colorData.hex.value}!`;
            copiedAlert.style.position = "absolute";
            copiedAlert.style.top = "-40px";
            copiedAlert.style.left = "50%";
            copiedAlert.style.transform = "translateX(-50%)";
            copiedAlert.style.backgroundColor = "#4CAF50";
            copiedAlert.style.color = "white";
            copiedAlert.style.padding = "8px 15px";
            copiedAlert.style.borderRadius = "4px";
            copiedAlert.style.fontSize = "12px";
            copiedAlert.style.fontWeight = "bold";
            copiedAlert.style.whiteSpace = "nowrap";
            copiedAlert.style.zIndex = "1000";
            copiedAlert.style.opacity = "0";
            copiedAlert.style.transition = "opacity 0.3s ease";
            
            // Make column position relative for absolute positioning
            col.style.position = "relative";
            
            // Add alert and show it
            col.appendChild(copiedAlert);
            setTimeout(() => {
                copiedAlert.style.opacity = "1";
            }, 10);
            
            // Change border color
            colorBox.style.border = '1px solid #4CAF50';
            
            // Remove alert and restore border after 2 seconds
            setTimeout(() => {
                copiedAlert.style.opacity = "0";
                colorBox.style.border = originalBorder;
                setTimeout(() => {
                    if (col.contains(copiedAlert)) {
                        col.removeChild(copiedAlert);
                    }
                }, 300);
            }, 600);
        });
    });
    col.appendChild(colorBox);

    const hexLabel = document.createElement("div");
    hexLabel.textContent = colorData.hex.value.toUpperCase();
    hexLabel.style.color = 'getContrastColor(colorData.hex.value)';
    hexLabel.style.fontSize = '11px';
    hexLabel.style.fontWeight = 'bold';
    hexLabel.style.marginTop = '8px';
    hexLabel.style.textAlign = 'center';
    col.appendChild(hexLabel);

    if (colorData.name && colorData.name.value) {
        const colorName = document.createElement("div");
        colorName.textContent = colorData.name.value;
        colorName.style.color = 'getContrastColor(colorData.hex.value)';
        colorName.style.textAlign = "center";
        colorName.style.marginTop = "2px";
        colorName.style.fontSize = "10px";
        
        col.appendChild(colorName);
    }

    return col;
}

function fetchColorScheme(hexColor, scheme) {
    const cleanHex = hexColor.replace("#", '');
    const apiUrl = `https://www.thecolorapi.com/scheme?hex=${cleanHex}&mode=${scheme}&count=5`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error("Error fetching color scheme:", error);
            throw error;
        });
}

function displayColorScheme(schemeData) {
    colorgrid.innerHTML = "";

    if (schemeData && schemeData.colors && Array.isArray(schemeData.colors) && schemeData.colors.length > 0) {
        schemeData.colors.forEach(color => {
            const colorColumn = createColorColumn(color);
            colorgrid.appendChild(colorColumn);
        });
    } else {
        displayError();
    }
}

// Fixed: function name typo
function generateColorScheme() {
    const selectedColor = colorinput.value;
    const selectedScheme = colorscheme.value.toLowerCase(); // Convert to lowercase for API

    displayLoading();

    fetchColorScheme(selectedColor, selectedScheme)
        .then(schemeData => {
            hideLoading();
            displayColorScheme(schemeData);
        })
        .catch(error => {
            displayError();
            console.error("Failed to fetch color scheme", error);
        });
}

// Fixed: use correct function name
getschemebtn.addEventListener("click", generateColorScheme);

colorinput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        generateColorScheme();
    }
});

colorscheme.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        generateColorScheme();
    }
}); 

// Fixed: use colorinput instead of colorPicker
colorinput.addEventListener("input", () => {
    clearTimeout(window.colorPickerTimeout);
    window.colorPickerTimeout = setTimeout(generateColorScheme, 500);
});