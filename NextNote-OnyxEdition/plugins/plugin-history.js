// plugins/plugin-history.js

window.registerNextNotePlugin({
  name: "History",
  onLoad: function(app) {
    // --- Add History Button to Toolbar ---
    const histBtn = document.createElement("button");
    histBtn.textContent = "🕒 History";
    histBtn.title = "View/Edit Note History (Snapshots)";
    histBtn.style.marginLeft = "0.5em";
    document.getElementById("toolbar").appendChild(histBtn);

    // --- Simple Snapshot Store: per-note, stored in localStorage by page ID ---
    function getSnapshots(pageId) {
      try {
        return JSON.parse(localStorage.getItem("nextnote_snapshots_" + pageId) || "[]");
      } catch (e) { return []; }
    }
    function saveSnapshots(pageId, snapshots) {
      localStorage.setItem("nextnote_snapshots_" + pageId, JSON.stringify(snapshots));
    }
    function addSnapshot(page) {
      if (!page || !page.id) return;
      const snapshots = getSnapshots(page.id);
      snapshots.unshift({
        content: page.markdown,
        ts: new Date().toISOString()
      });
      // Limit to last 15 versions
      while (snapshots.length > 15) snapshots.pop();
      saveSnapshots(page.id, snapshots);
    }

    // --- Modal for Version Browser ---
    const modal = document.createElement("div");
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.left = 0;
    modal.style.top = 0;
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.14)";
    modal.style.zIndex = 2008;
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";

    const inner = document.createElement("div");
    inner.style.background = "#fff";
    inner.style.margin = "10vh auto";
    inner.style.maxWidth = "550px";
    inner.style.width = "97vw";
    inner.style.borderRadius = "10px";
    inner.style.padding = "29px";
    inner.style.boxShadow = "0 4px 22px rgba(0,0,0,0.17)";
    inner.style.position = "relative";
    inner.style.display = "flex";
    inner.style.flexDirection = "column";
    inner.style.gap = "16px";
    modal.appendChild(inner);

    // Close
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "15px";
    closeBtn.style.right = "20px";
    closeBtn.onclick = () => (modal.style.display = "none");
    inner.appendChild(closeBtn);

    // Header
    const header = document.createElement("h2");
    header.textContent = "Page History";
    header.style.marginTop = "0";
    inner.appendChild(header);

    // Snapshot List
    const snapList = document.createElement("div");
    inner.appendChild(snapList);

    // Restore
    function showHistoryModal(page) {
      snapList.innerHTML = "";
      const snapshots = getSnapshots(page.id);
      if (!snapshots.length) {
        snapList.innerHTML = "<div style='color:#888;'>No history/snapshots for this page yet.</div>";
      } else {
        snapshots.forEach((snap, i) => {
          const row = document.createElement("div");
          row.style.margin = "6px 0";
          row.style.background = "#f5f8fc";
          row.style.padding = "9px";
          row.style.borderRadius = "6px";
          row.style.boxShadow = "0 1px 4px rgba(120,144,190,0.07)";
          const date = document.createElement("span");
          date.style.fontWeight = "bold";
          date.style.fontSize = "13px";
          date.style.color = "#1e5eab";
          date.textContent = new Date(snap.ts).toLocaleString();
          row.appendChild(date);
          // Preview content snippet
          const snippet = document.createElement("div");
          snippet.textContent = (snap.content || "").substring(0, 130) + (snap.content.length > 130 ? "…" : "");
          snippet.style.fontSize = "13px";
          snippet.style.margin = "7px 0 7px 0";
          row.appendChild(snippet);
          // Restore button
          const restoreBtn = document.createElement("button");
          restoreBtn.textContent = "Restore";
          restoreBtn.style.marginLeft = "11px";
          restoreBtn.onclick = function() {
            if (confirm("Restore this snapshot? This will overwrite current content.")) {
              page.markdown = snap.content;
              saveNotebook();
              if (window.refreshCurrentPage) window.refreshCurrentPage();
              modal.style.display = "none";
            }
          };
          row.appendChild(restoreBtn);
          snapList.appendChild(row);
        });
      }
      modal.style.display = "flex";
    }

    // --- Save Notebook Helper ---
    function saveNotebook() {
      if (window._multiNotebook && typeof window._multiNotebook.saveNotebook === "function") {
        window._multiNotebook.saveNotebook(window._multiNotebook.currentNotebookIndex || 0);
      }
    }

    // --- Patch saveCurrentPage to create snapshot ---
    const origSaveCurrentPage = window.saveCurrentPage;
    window.saveCurrentPage = function() {
      if (window.currentPage) addSnapshot(window.currentPage);
      if (typeof origSaveCurrentPage === "function") origSaveCurrentPage();
    };

    // --- History button handler: open modal for current page ---
    histBtn.onclick = function() {
      const page = window.currentPage;
      if (!page) {
        alert("No page selected.");
        return;
      }
      showHistoryModal(page);
    };

    // Add modal to body
    document.body.appendChild(modal);

    // Expose for debug
    window._history = {
      getSnapshots,
      addSnapshot,
      showHistoryModal
    };
  }
});
