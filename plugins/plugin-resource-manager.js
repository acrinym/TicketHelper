// plugins/plugin-resource-manager.js

window.registerNextNotePlugin({
  name: "ResourceManager",
  onLoad: function(app) {
    // --- Create the Attachments Button for Toolbar ---
    const attachmentsBtn = document.createElement("button");
    attachmentsBtn.textContent = "📎 Attachments";
    attachmentsBtn.title = "Open Resource Manager";
    attachmentsBtn.style.marginLeft = "0.5em";
    document.getElementById("toolbar").appendChild(attachmentsBtn);

    // --- Resource Manager Modal/Panel Setup ---
    const modalOverlay = document.createElement("div");
    modalOverlay.style.display = "none";
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100vw";
    modalOverlay.style.height = "100vh";
    modalOverlay.style.background = "rgba(0,0,0,0.3)";
    modalOverlay.style.zIndex = "1000";
    modalOverlay.id = "resourceManagerOverlay";

    const modalContainer = document.createElement("div");
    modalContainer.style.background = "#fff";
    modalContainer.style.borderRadius = "8px";
    modalContainer.style.width = "450px";
    modalContainer.style.maxWidth = "96vw";
    modalContainer.style.maxHeight = "90vh";
    modalContainer.style.margin = "5vh auto";
    modalContainer.style.padding = "24px";
    modalContainer.style.boxShadow = "0 4px 24px rgba(0,0,0,0.17)";
    modalContainer.style.position = "relative";
    modalContainer.style.overflowY = "auto";

    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    // --- Modal Header ---
    const header = document.createElement("h2");
    header.textContent = "Resource Manager";
    modalContainer.appendChild(header);

    // --- File Upload Area ---
    const uploadLabel = document.createElement("label");
    uploadLabel.textContent = "Upload File or Image: ";
    uploadLabel.htmlFor = "resourceUploadInput";
    uploadLabel.style.fontWeight = "bold";
    uploadLabel.style.display = "block";
    modalContainer.appendChild(uploadLabel);

    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.id = "resourceUploadInput";
    uploadInput.multiple = true;
    modalContainer.appendChild(uploadInput);

    modalContainer.appendChild(document.createElement("hr"));

    // --- Resource List Container ---
    const resourceList = document.createElement("div");
    resourceList.id = "resourceList";
    modalContainer.appendChild(resourceList);

    // --- Close Button ---
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "12px";
    closeBtn.style.right = "16px";
    closeBtn.style.background = "#dc3545";
    closeBtn.style.color = "#fff";
    closeBtn.style.border = "none";
    closeBtn.style.padding = "4px 14px";
    closeBtn.style.borderRadius = "5px";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => { modalOverlay.style.display = "none"; };
    modalContainer.appendChild(closeBtn);

    // --- Helpers to Manage Resource Data in Notebook ---
    function getNotebook() {
      // Assume a single global 'notebook' object or state, or use 'sections' as fallback.
      // Replace this as needed to hook into your app's real notebook structure.
      if (window.notebook) return window.notebook;
      if (window.sections) {
        // Polyfill: create notebook object on-the-fly
        if (!window._resourceNotebook) {
          window._resourceNotebook = { resources: [], sections: window.sections };
        }
        return window._resourceNotebook;
      }
      alert("No notebook found! Resource Manager requires a notebook object.");
      return null;
    }

    function saveNotebook() {
      // If your app has a save function, call it here.
      // For the example, if using sections as base, save resources in localStorage
      const notebook = getNotebook();
      if (!notebook) return;
      if (window.sections) {
        localStorage.setItem("resource_manager_resources", JSON.stringify(notebook.resources));
      }
    }

    function loadResources() {
      const notebook = getNotebook();
      if (!notebook) return [];
      if (!notebook.resources) notebook.resources = [];
      if (window.sections && notebook.resources.length === 0) {
        // Try to load old resources if present
        try {
          const stored = localStorage.getItem("resource_manager_resources");
          if (stored) notebook.resources = JSON.parse(stored);
        } catch (e) {}
      }
      return notebook.resources;
    }

    function addResource(fileObj, callback) {
      const notebook = getNotebook();
      if (!notebook) return;
      // Assign unique GUID for resource
      const id = crypto.randomUUID();
      const reader = new FileReader();
      reader.onload = function(e) {
        const resource = {
          id: id,
          fileName: fileObj.name,
          data: e.target.result, // base64 for now, can be Blob in future
          mimeType: fileObj.type,
          uploaded: new Date().toISOString()
        };
        notebook.resources.push(resource);
        saveNotebook();
        renderResourceList();
        if (callback) callback(resource);
      };
      reader.readAsDataURL(fileObj);
    }

    function deleteResource(resourceId) {
      const notebook = getNotebook();
      if (!notebook) return;
      notebook.resources = notebook.resources.filter(r => r.id !== resourceId);
      saveNotebook();
      renderResourceList();
    }

    function renderResourceList() {
      const notebook = getNotebook();
      if (!notebook) return;
      const resources = notebook.resources || [];
      resourceList.innerHTML = "";
      if (resources.length === 0) {
        resourceList.innerHTML = "<div style='color:gray;margin:20px 0'>No resources uploaded yet.</div>";
        return;
      }
      // Table for resources
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.fontSize = "15px";
      table.innerHTML = `
        <tr>
          <th>Preview</th>
          <th>Name</th>
          <th>Type</th>
          <th>Inserted</th>
          <th>Action</th>
        </tr>
      `;
      resources.forEach(res => {
        const row = document.createElement("tr");
        // Preview
        const prevCell = document.createElement("td");
        if (res.mimeType && res.mimeType.startsWith("image/")) {
          const img = document.createElement("img");
          img.src = res.data;
          img.alt = res.fileName;
          img.style.maxWidth = "48px";
          img.style.maxHeight = "48px";
          prevCell.appendChild(img);
        } else {
          prevCell.innerHTML = "—";
        }
        row.appendChild(prevCell);

        // Name
        const nameCell = document.createElement("td");
        nameCell.textContent = res.fileName;
        row.appendChild(nameCell);

        // Type
        const typeCell = document.createElement("td");
        typeCell.textContent = res.mimeType || "n/a";
        row.appendChild(typeCell);

        // Inserted (Date)
        const dateCell = document.createElement("td");
        dateCell.textContent = (res.uploaded && res.uploaded.split("T")[0]) || "-";
        row.appendChild(dateCell);

        // Actions
        const actionCell = document.createElement("td");

        // Insert Button
        const insertBtn = document.createElement("button");
        insertBtn.textContent = "Insert";
        insertBtn.title = "Insert resource into current page";
        insertBtn.onclick = function() {
          // Insert image or file link into Quill at cursor
          if (window.quill) {
            if (res.mimeType && res.mimeType.startsWith("image/")) {
              const range = window.quill.getSelection(true);
              window.quill.insertEmbed(range ? range.index : 0, "image", res.data, "user");
            } else {
              const range = window.quill.getSelection(true);
              const link = `[${res.fileName}](${res.data})`;
              window.quill.insertText(range ? range.index : 0, link, "user");
            }
          } else {
            alert("No active editor found.");
          }
        };
        actionCell.appendChild(insertBtn);

        // Download Button
        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Download";
        downloadBtn.title = "Download this resource";
        downloadBtn.onclick = function() {
          const a = document.createElement("a");
          a.href = res.data;
          a.download = res.fileName;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
        actionCell.appendChild(downloadBtn);

        // Delete Button
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.title = "Delete this resource";
        delBtn.style.color = "#c00";
        delBtn.onclick = function() {
          if (confirm(`Are you sure you want to delete "${res.fileName}"?`)) {
            deleteResource(res.id);
          }
        };
        actionCell.appendChild(delBtn);

        row.appendChild(actionCell);

        table.appendChild(row);
      });
      resourceList.appendChild(table);
    }

    // --- File Upload Handler ---
    uploadInput.onchange = function(e) {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      files.forEach(f => addResource(f));
      uploadInput.value = ""; // Clear input
    };

    // --- Attachments Button Handler: open modal ---
    attachmentsBtn.onclick = function() {
      modalOverlay.style.display = "block";
      renderResourceList();
    };

    // --- Initial Load of Resources ---
    loadResources();

    // --- Style modal overlay for easy closing on background click ---
    modalOverlay.onclick = function(e) {
      if (e.target === modalOverlay) modalOverlay.style.display = "none";
    };

    // --- Extra: expose to app for testing/debugging ---
    window._resourceManager = {
      getNotebook,
      addResource,
      deleteResource,
      renderResourceList,
      saveNotebook,
      loadResources
    };
  }
});
