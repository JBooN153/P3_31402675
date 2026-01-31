import { useContext } from "react";
import { AdminContext } from "../context/Admin";

export const useAdmin = () => {
    const context = useContext(AdminContext)

    if (!context) {
        throw new Error('Se debe usar dentro de un adminprovider')
    }

    return {
        getUser: context.getUser,
        getUserById: context.getUserById,
        updateUser: context.updateUser,
        deleteUser: context.deleteUser
    }
}