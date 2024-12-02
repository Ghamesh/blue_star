const imageInput = document.getElementById("imageInput");
const fileListDiv = document.getElementById("fileList");
const convertBtn = document.getElementById("convertBtn");

const logoBase64 = "./images/logo.png"; // Replace with your Base64 logo

// Update file list display when images are selected
const files = imageInput.files;
if (files.length === 0) {

    convertBtn.style.display = "none"
}
imageInput.addEventListener("change", () => {
    const files = imageInput.files;
    fileListDiv.innerHTML = ""; // Clear previous list

    if (files.length === 0) {
        fileListDiv.innerHTML = "<p>No images selected.</p>";
        return;
    }
    if (files.length > 0) {
        convertBtn.style.display = "block"
    }


    const list = document.createElement("ol");
    for (let i = 0; i < files.length; i++) {
        const listItem = document.createElement("li");
        listItem.textContent = files[i].name;
        list.appendChild(listItem);
    }

    fileListDiv.appendChild(list);
    const summary = document.createElement("p");
    summary.innerHTML = `<span class="highlight">${files.length}</span> images selected.`;
    fileListDiv.appendChild(summary);
});

// Convert to PDF when button is clicked
convertBtn.addEventListener("click", () => {
    const files = imageInput.files;

    if (files.length === 0) {
        alert("Please select images!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const addHeader = () => {
        // Add Logo (Centered)
        pdf.addImage(logoBase64, "PNG", (pageWidth - 30) / 2, 10, 30, 15); // Logo (width=30, height=15)

        // Add Company Name (Centered as H1)
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("Blue Star Air Express Courier", pageWidth / 2, 30, { align: "center" });

        // Add Email and Mobile Number (Single Line, Centered)
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text("Email: ram.blue09@gmail.com | Phone: +91-9828874892", pageWidth / 2, 40, { align: "center" });

        // Horizontal line below header
        pdf.line(10, 45, pageWidth - 10, 45);
    };

    let promises = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        promises.push(new Promise((resolve) => {
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    const imgWidth = img.width;
                    const imgHeight = img.height;

                    const aspectRatio = imgWidth / imgHeight; // Calculate aspect ratio
                    const availableWidth = pageWidth - 20; // 20px margin
                    const availableHeight = pageHeight - 60; // Leave space for header and margins

                    // Scale image to fit within the available space
                    let scaledWidth = availableWidth;
                    let scaledHeight = availableWidth / aspectRatio;

                    if (scaledHeight > availableHeight) {
                        scaledHeight = availableHeight;
                        scaledWidth = availableHeight * aspectRatio;
                    }

                    // Center image horizontally
                    const xPosition = (pageWidth - scaledWidth) / 2;
                    const yPosition = 50; // Start below the header

                    // Add a new page if not the first image
                    if (i > 0) {
                        pdf.addPage();
                    }

                    // Add header to every page
                    addHeader();

                    // Add the image to the PDF
                    pdf.addImage(img, "JPEG", xPosition, yPosition, scaledWidth, scaledHeight);

                    resolve();
                };
            };

            reader.readAsDataURL(file);
        }));

    }


    Promise.all(promises).then(() => {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10);
        const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, "-");
        const fileName = `Blue Star_${formattedDate}_${formattedTime}.pdf`;

        pdf.save(fileName); // Save the PDF
        // location.reload(); // This will unselect the images and reset the page
        imageInput.value = ""; // Reset the file input
        fileListDiv.innerHTML = ""; // Clear the file list display
        convertBtn.style.display = "none"; // Hide the convert button


    });

    promises = [];
});