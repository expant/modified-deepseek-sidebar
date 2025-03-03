<script setup>
import _ from "lodash";
import { onMounted, onUnmounted, inject, nextTick } from "vue";
import { getBaseFolderNames, sortBaseNames } from "@/utils/baseFolderNames.js";
import { deleteFolder, createFolder } from "@/background/background.js";
import ContextMenuButton from "./buttons/ContextMenuButton.vue";

const props = defineProps({
  position: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["close"]);
const folderList = inject("folderList");
const chatList = inject("chatList");
const contextMenu = inject("contextMenu");
const baseFolderNames = inject("baseFolderNames");
const showSearchChats = inject("showSearchChats");
const isEditingFolderName = inject("isEditingFolderName");

const onOutsideClick = (event) => {
  const contextMenu = document.querySelector(".context-menu");
  if (contextMenu && !contextMenu.contains(event.target)) {
    emit("close");
  }
};

const onRenameFolder = async () => {
  isEditingFolderName.value = true;
  contextMenu.value = { ...contextMenu.value, isOpen: false };
  await nextTick();
  document.querySelector(".folder-name__input").focus();
};

const onDeleteFolder = async () => {
  const id = contextMenu.value.folderId;
  folderList.value = deleteFolder(folderList.value, id);
  chatList.value = chatList.value.map((item) =>
    item.folderId === id ? { ...item, folderId: null } : item
  );
  const baseNames = getBaseFolderNames(folderList.value, []);
  baseFolderNames.value = baseNames.sort(sortBaseNames);
  await chrome.storage.local.set({ folders: folderList.value });
  await chrome.storage.local.set({ chats: chatList.value });
  contextMenu.value = { ...contextMenu.value, isOpen: false };
};

const onCreateFolder = async () => {
  const id = contextMenu.value.folderId;
  const [folders, newFolderId, newParentFolderId] = createFolder(
    _.cloneDeep(folderList.value),
    id,
    baseFolderNames.value
  );
  folderList.value = folders;
  chatList.value = chatList.value.map((chat) =>
    chat.folderId === id ? { ...chat, folderId: newParentFolderId } : chat
  );
  const baseNames = getBaseFolderNames(folderList.value, []);
  baseFolderNames.value = baseNames.sort(sortBaseNames);
  contextMenu.value = {
    ...contextMenu.value,
    isOpen: false,
    folderId: newFolderId,
  };
  isEditingFolderName.value = true;
  await chrome.storage.local.set({ folders });
  await chrome.storage.local.set({ chats: chatList.value });
  await nextTick();
  document.querySelector(".folder-name__input").focus();
};

const onAddChat = () => {
  showSearchChats.value = true;
  contextMenu.value = { ...contextMenu.value, isOpen: false };
};

onMounted(async () => document.addEventListener("click", onOutsideClick));
onUnmounted(() => document.removeEventListener("click", onOutsideClick));
</script>

<template>
  <transition name="fade">
    <div
      class="context-menu"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }"
    >
      <ContextMenuButton name="Add chat(s)" @click="onAddChat" />
      <ContextMenuButton name="New folder" @click="onCreateFolder" />
      <div class="line"></div>
      <ContextMenuButton name="Rename" @click="onRenameFolder" />
      <ContextMenuButton name="Delete" @click="onDeleteFolder" />
    </div>
  </transition>
</template>
