import { classNames } from "@/variables.js";

export const getFolderNameById = (folders, id) =>
  folders.reduce((acc, item) => {
    if (acc || item.type === "chat") return acc;
    if (item.id === id) return item.name;
    if (item.children) return getFolderNameById(item.children, id);
    return acc;
  }, null);

export const getDSChatEl = (name) => {
  const elements = document.querySelectorAll(classNames.CHAT_TEXT);
  const entries = Object.entries(elements);
  const [, el] = entries.find(([_, el]) => el.textContent === name);
  return el;
};

export const isNameNotUnique = (items, name) =>
  items.some((item) => {
    if (item.type === "chat") return false;
    if (item.name === name) return true;
    if (item.children) return isNameNotUnique(item.children, name);
  });

export const convertObjToArrDeep = (object, type) => {
  const arr = Object.values(object);

  switch (type) {
    case "folders": {
      return arr.map((item) => {
        if (item.type === "chat") return item;
        item.children = convertObjToArrDeep(item.children, "folders");
        return item;
      });
    }
    case "chats":
      return arr;
    default:
      throw new Error(`Unkown array type: ${type}`);
  }
};

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const getDSContextMenu = () => {
  const { CONTEXT_MENU } = classNames;
  const menus = document.querySelectorAll(`.${CONTEXT_MENU}`);
  const entries = Object.entries(menus);
  const [, menu] = entries.find(([, el]) => el.style.zIndex === "1024");
  return menu;
};
// export const getChatList = () => {
//   const chatElements = document.querySelectorAll(".f9edaa3c");
//   const entries = Object.entries(chatElements);
//   return entries.find(([_, el]) => {
//     const textEl = el.querySelector(".c08e6e93");
//     return textEl.textContent === "Правильный прием витамина D" ? true : false;
//   });
// };
