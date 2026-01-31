import React, { createContext } from 'react';
import tagsService from '../services/tags';

export const TagsContext = createContext();

export const TagsProvider = ({ children }) => {
  const getAllTags = async () => {
    return await tagsService.getAllTags()
  }

  const getTagById = async (id) => {
    return await tagsService.getTagById(id)
  }

  const createTag = async (tagData) => {
    return await tagsService.createTag(tagData)
  }

  const updateTag = async (id, tagData) => {
    return await tagsService.updateTag(id, tagData)
  }

  const deleteTag = async (id) => {
    return await tagsService.deleteTag(id)
  }

  return (
    <TagsContext.Provider value={{ getAllTags, getTagById, createTag, updateTag, deleteTag }}>
      {children}
    </TagsContext.Provider>
  )
};
