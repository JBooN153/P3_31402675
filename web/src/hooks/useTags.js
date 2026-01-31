import { useContext } from "react";
import { TagsContext } from "../context/Tags";

export const useTags = () => {
    const context = useContext(TagsContext)

    if (!context) {
        throw new Error('useTags debe usarse dentro de TagsProvider')
    }

    return {
        getAllTags: context.getAllTags,
        getTagById: context.getTagById,
        createTag: context.createTag,
        updateTag: context.updateTag,
        deleteTag: context.deleteTag
    }
}
