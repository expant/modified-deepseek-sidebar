import { getNewUntitled } from "./utils/helpers.js";

export const renameFolder = (folders, id, name) =>
  folders.map((item) => {
    if (item.type === "chat") return item;
    if (id !== item.id) {
      if (item.children)
        return { ...item, children: renameFolder(item.children, id, name) };
      return item;
    }
    if (item.name !== name && name) return { ...item, name };
    return item;
  });

export const deleteFolder = (folders, id) =>
  folders.filter((item) => {
    if (item.type === "chat") return true;
    if (item.id === id) return false;
    if (item.children) {
      item.children = deleteFolder(item.children, id);
      return true;
    }
  });

export const createFolder = (folders, id, baseNames) => {
  let newFolderId = 0;
  const name = getNewUntitled(baseNames);
  const newFolder = {
    id: Date.now(),
    type: "folder",
    isOpen: false,
    children: [],
    name,
  };

  if (!id) {
    newFolderId = newFolder.id;
    folders.push(newFolder);
    return [folders, newFolderId];
  }

  const getNewFolders = (items) =>
    items.map((item) => {
      if (item.type === "chat") return item;
      if (item.id === id) {
        item = { ...item, id: Date.now() + 1, isOpen: true };
        item.children.unshift(newFolder);
        newFolderId = newFolder.id;
        return item;
      }
      return item.children
        ? { ...item, children: getNewFolders(item.children) }
        : item;
    });
  return [getNewFolders(folders), newFolderId];
};
