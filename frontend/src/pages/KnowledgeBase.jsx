import { useState, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import MarkdownViewer from "../components/MarkdownViewer";
import {
  Search,
  FileText,
  Plus,
  BookOpen,
  Save,
  Trash2,
  Edit2,
  Folder,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  X,
} from "lucide-react";

export default function KnowledgeBase() {
  const {
    notes,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
    noteFolders,
    fetchNoteFolders,
    addNoteFolder,
    updateNoteFolder,
    deleteNoteFolder,
  } = useAppStore();

  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    folderId: "",
    content: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});

  // Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState("create");
  const [targetFolderId, setTargetFolderId] = useState(null);
  const [targetFolderName, setTargetFolderName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const [dragOverFolderId, setDragOverFolderId] = useState(null);

  useEffect(() => {
    fetchNotes();
    fetchNoteFolders();
  }, [fetchNotes, fetchNoteFolders]);

  useEffect(() => {
    if (noteFolders.length > 0 && Object.keys(expandedFolders).length === 0) {
      const initialExpanded = {};
      noteFolders.forEach((folder) => {
        initialExpanded[folder._id] = true;
      });
      setExpandedFolders(initialExpanded);
    }
  }, [noteFolders, expandedFolders]);

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setEditForm({
      title: note.title,
      folderId: note.folderId || "null",
      content: note.content,
    });
    setIsEditing(false);
  };

  const handleCreateNewNote = async () => {
    // Automatically create new notes as loose files, you can drag them later
    const newNote = await addNote({
      title: "Untitled Note",
      folderId: null,
      content: "",
    });
    if (newNote) {
      handleSelectNote(newNote);
      setIsEditing(true);
    }
  };

  // --- DB-POWERED FOLDER MANAGEMENT ---
  const openCreateFolderModal = () => {
    setFolderModalMode("create");
    setNewFolderName("");
    setIsFolderModalOpen(true);
  };

  const openRenameFolderModal = (e, folder) => {
    e.stopPropagation();
    setFolderModalMode("rename");
    setTargetFolderId(folder._id);
    setTargetFolderName(folder.folderName);
    setNewFolderName(folder.folderName);
    setIsFolderModalOpen(true);
  };

  const handleFolderModalSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = newFolderName.trim();
    if (!trimmedName) return;

    if (folderModalMode === "create") {
      const newFolder = await addNoteFolder(trimmedName);
      if (newFolder) {
        setExpandedFolders((prev) => ({ ...prev, [newFolder._id]: true }));
      }
    } else if (folderModalMode === "rename") {
      await updateNoteFolder(targetFolderId, trimmedName);
    }
    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = async (e, folderId, folderName, noteCount) => {
    e.stopPropagation();
    const msg =
      noteCount > 0
        ? `Are you sure you want to delete "${folderName}" and ALL ${noteCount} notes inside it?`
        : `Are you sure you want to delete the empty folder "${folderName}"?`;

    if (window.confirm(msg)) {
      await deleteNoteFolder(folderId);

      if (selectedNote && selectedNote.folderId === folderId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    }
  };

  // --- DRAG AND DROP (USING IDs) ---
  const handleDragStart = (e, noteId) => {
    e.dataTransfer.setData("noteId", noteId);
  };

  const handleDragOver = (e, targetFolderId) => {
    e.preventDefault();
    if (dragOverFolderId !== targetFolderId)
      setDragOverFolderId(targetFolderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = async (e, targetFolderId) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const noteId = e.dataTransfer.getData("noteId");
    if (!noteId) return;

    const noteToMove = notes.find((n) => n._id === noteId);

    const processedTargetId = targetFolderId === "null" ? null : targetFolderId;

    if (noteToMove && noteToMove.folderId !== processedTargetId) {
      await updateNote(noteId, { ...noteToMove, folderId: processedTargetId });

      if (processedTargetId) {
        setExpandedFolders((prev) => ({ ...prev, [processedTargetId]: true }));
      }

      if (selectedNote && selectedNote._id === noteId) {
        setSelectedNote((prev) => ({ ...prev, folderId: processedTargetId }));
        setEditForm((prev) => ({
          ...prev,
          folderId: processedTargetId || "null",
        }));
      }
    }
  };

  // --- NOTE MANAGEMENT ---
  const handleSave = async () => {
    if (!selectedNote) return;

    const dataToSave = {
      ...editForm,
      folderId: editForm.folderId === "null" ? null : editForm.folderId,
    };

    await updateNote(selectedNote._id, dataToSave);
    setIsEditing(false);
    setSelectedNote({ ...selectedNote, ...dataToSave });

    if (dataToSave.folderId) {
      setExpandedFolders((prev) => ({ ...prev, [dataToSave.folderId]: true }));
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (window.confirm("Are you sure you want to delete this note?")) {
      await deleteNote(selectedNote._id);
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  // --- DATA FILTERING ---
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const rootNotes = filteredNotes.filter((n) => !n.folderId);

  const getFolderName = (id) => {
    if (!id) return "Loose File";
    const folder = noteFolders.find((f) => f._id === id);
    return folder ? folder.folderName : "Unknown Folder";
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 space-y-4 relative">
      {/* Page Header Actions */}
      <div className="flex justify-end items-end">
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateFolderModal}
            className="flex items-center gap-2 bg-forge-surface border border-forge-border text-forge-textPrimary px-4 py-2 rounded-lg font-semibold hover:border-forge-accent transition-colors shadow-brand"
          >
            <FolderPlus size={18} className="text-forge-textSecondary" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <button
            onClick={handleCreateNewNote}
            className="flex items-center gap-2 bg-forge-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-forge-accentHover transition-colors shadow-brand"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[60vh]">
        <div className="col-span-1 bg-forge-surface border border-forge-border rounded-xl p-4 flex flex-col shadow-brand max-h-[70vh]">
          <div className="mb-4 border-b border-forge-border pb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-forge-textSecondary"
                size={16}
              />
              <input
                type="text"
                placeholder="Search notes by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-forge-bg border border-forge-border text-forge-textPrimary rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-forge-accent transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {noteFolders.length === 0 && rootNotes.length === 0 ? (
              <p className="text-center text-forge-textSecondary text-sm mt-4">
                No folders or notes found.
              </p>
            ) : (
              <div className="space-y-4">
                {/* 1. RENDER FOLDERS */}
                {noteFolders.map((folder) => {
                  const folderNotes = filteredNotes.filter(
                    (n) => n.folderId === folder._id,
                  );

                  return (
                    <div key={folder._id} className="space-y-1">
                      <div
                        onDragOver={(e) => handleDragOver(e, folder._id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, folder._id)}
                        className={`flex items-center group w-full py-1.5 px-2 rounded-xl transition-colors cursor-pointer border-2 ${
                          dragOverFolderId === folder._id
                            ? "bg-forge-accent/10 border-forge-accent border-dashed"
                            : "border-transparent hover:bg-forge-surfaceHover"
                        }`}
                      >
                        <button
                          onClick={() => toggleFolder(folder._id)}
                          className="flex-1 flex items-center gap-2 text-forge-textPrimary font-bold"
                        >
                          <span className="text-forge-textSecondary transition-colors">
                            {expandedFolders[folder._id] ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </span>
                          <Folder size={18} className="text-indigo-400" />
                          <span className="uppercase tracking-wider text-xs mt-0.5 pointer-events-none">
                            {folder.folderName}
                          </span>
                          <span className="ml-2 text-xs font-medium text-forge-textSecondary bg-forge-bg px-2 py-0.5 rounded-full pointer-events-none">
                            {folderNotes.length}
                          </span>
                        </button>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={(e) => openRenameFolderModal(e, folder)}
                            className="p-1.5 text-forge-textSecondary hover:text-forge-accent hover:bg-forge-accent/10 rounded-lg transition-colors"
                            title="Rename Folder"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) =>
                              handleDeleteFolder(
                                e,
                                folder._id,
                                folder.folderName,
                                folderNotes.length,
                              )
                            }
                            className="p-1.5 text-forge-textSecondary hover:text-forge-danger hover:bg-forge-danger/10 rounded-lg transition-colors"
                            title="Delete Folder"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {expandedFolders[folder._id] && (
                        <div className="pl-6 space-y-1 mt-1">
                          {folderNotes.length === 0 ? (
                            <div className="p-2 text-xs italic text-forge-textSecondary opacity-60">
                              Empty folder.
                            </div>
                          ) : (
                            folderNotes.map((note) => (
                              <div
                                key={note._id}
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, note._id)
                                }
                                onClick={() => handleSelectNote(note)}
                                className={`flex items-center gap-2 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 ${
                                  selectedNote?._id === note._id
                                    ? "bg-forge-accent/10 text-forge-accent font-semibold"
                                    : "text-forge-textSecondary hover:bg-forge-surfaceHover hover:text-forge-textPrimary font-medium"
                                }`}
                              >
                                <FileText
                                  size={14}
                                  className="shrink-0 pointer-events-none"
                                />
                                <span className="text-sm truncate pointer-events-none">
                                  {note.title}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 2. RENDER LOOSE / ROOT NOTES */}
                {(rootNotes.length > 0 || dragOverFolderId === "null") && (
                  <div
                    onDragOver={(e) => handleDragOver(e, "null")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "null")}
                    className={`pt-3 border-t border-forge-border transition-colors border-2 ${
                      dragOverFolderId === "null"
                        ? "bg-forge-accent/5 border-dashed border-forge-accent rounded-2xl p-2"
                        : "border-transparent"
                    }`}
                  >
                    {rootNotes.length > 0 && (
                      <p className="text-xs font-bold text-forge-textSecondary uppercase tracking-wider mb-2 px-2">
                        Loose Files
                      </p>
                    )}

                    {dragOverFolderId === "null" && rootNotes.length === 0 && (
                      <div className="text-xs text-forge-accent font-medium text-center py-2 pointer-events-none">
                        Drop here to unassign from folder
                      </div>
                    )}

                    {rootNotes.map((note) => (
                      <div
                        key={note._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, note._id)}
                        onClick={() => handleSelectNote(note)}
                        className={`flex items-center gap-2 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 ${
                          selectedNote?._id === note._id
                            ? "bg-forge-accent/10 text-forge-accent font-semibold"
                            : "text-forge-textSecondary hover:bg-forge-surfaceHover hover:text-forge-textPrimary font-medium"
                        }`}
                      >
                        <FileText
                          size={14}
                          className="shrink-0 pointer-events-none"
                        />
                        <span className="text-sm truncate pointer-events-none">
                          {note.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-forge-surface border border-forge-border rounded-xl p-6 shadow-brand flex flex-col h-[70vh] overflow-y-auto">
          {selectedNote ? (
            <div className="animate-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-forge-border">
                {isEditing ? (
                  <div className="flex items-center gap-2 relative">
                    <Folder size={16} className="text-forge-textSecondary" />
                    <select
                      value={editForm.folderId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, folderId: e.target.value })
                      }
                      className="text-xs font-bold text-forge-accent bg-forge-accent/10 px-3 py-1 rounded-full uppercase tracking-wider focus:outline-none border border-forge-accent/20 cursor-pointer appearance-none"
                    >
                      <option value="null">-- Loose File --</option>
                      {noteFolders.map((folder) => (
                        <option key={folder._id} value={folder._id}>
                          {folder.folderName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {!selectedNote.folderId ? (
                      <span className="text-xs font-bold text-forge-textSecondary border border-forge-border bg-forge-bg px-3 py-1 rounded-full uppercase tracking-wider">
                        Loose File
                      </span>
                    ) : (
                      <>
                        <Folder
                          size={16}
                          className="text-forge-textSecondary"
                        />
                        <span className="text-xs font-bold text-forge-accent bg-forge-accent/10 px-3 py-1 rounded-full uppercase tracking-wider">
                          {getFolderName(selectedNote.folderId)}
                        </span>
                      </>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 text-sm bg-forge-accent text-white px-3 py-1.5 rounded-xl hover:bg-forge-accentHover transition-colors"
                    >
                      <Save size={16} /> Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-sm bg-forge-bg border border-forge-border text-forge-textPrimary px-3 py-1.5 rounded-xl hover:border-forge-accent transition-colors"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                  )}
                  <button
                    onClick={handleDeleteNote}
                    className="flex items-center gap-1 text-sm bg-forge-danger/10 text-forge-danger px-3 py-1.5 rounded-xl hover:bg-forge-danger/20 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="text-3xl font-bold text-forge-textPrimary mb-6 w-full bg-transparent focus:outline-none border-b border-forge-border pb-2 focus:border-forge-accent transition-colors"
                  placeholder="Note Title"
                />
              ) : (
                <h3 className="text-3xl font-bold text-forge-textPrimary mb-6">
                  {selectedNote.title}
                </h3>
              )}
              <div className="flex-1 min-h-[300px] flex flex-col">
                {isEditing ? (
                  <textarea
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm({ ...editForm, content: e.target.value })
                    }
                    className="w-full h-full flex-1 bg-forge-bg border border-forge-border rounded-xl p-4 text-forge-textPrimary font-mono text-sm focus:outline-none focus:border-forge-accent resize-none transition-colors"
                    placeholder="Write your notes in Markdown here..."
                  />
                ) : (
                  <div className="h-full overflow-y-auto pr-2">
                    {selectedNote.content ? (
                      <MarkdownViewer content={selectedNote.content} />
                    ) : (
                      <span className="italic text-forge-textSecondary opacity-50">
                        No content yet. Click edit to start writing.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-forge-textSecondary opacity-50">
              <Folder size={48} className="mb-4 opacity-50" />
              <p>Select a folder or a loose file to read</p>
            </div>
          )}
        </div>
      </div>

      {/* Shared Modal for Create & Rename */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-forge-textPrimary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-forge-surface w-full max-w-sm rounded-xl shadow-brand border border-forge-border p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsFolderModalOpen(false)}
              className="absolute top-4 right-4 text-forge-textSecondary hover:text-forge-danger transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-forge-accent/10 rounded-xl text-forge-accent">
                {folderModalMode === "create" ? (
                  <FolderPlus size={24} />
                ) : (
                  <Edit2 size={24} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-forge-textPrimary">
                  {folderModalMode === "create"
                    ? "Create Folder"
                    : "Rename Folder"}
                </h3>
              </div>
            </div>
            <form onSubmit={handleFolderModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., System Design, React..."
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-lg text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="w-1/2 py-2.5 bg-forge-bg border border-forge-border text-forge-textPrimary rounded-lg font-bold hover:border-forge-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !newFolderName.trim() ||
                    newFolderName.trim() === targetFolderName
                  }
                  className="w-1/2 py-2.5 bg-forge-accent text-white rounded-lg font-bold hover:bg-forge-accentHover transition-colors disabled:opacity-50"
                >
                  {folderModalMode === "create" ? "Create" : "Rename"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
