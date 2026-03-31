import React from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { ROLES } from "../../../shared/constants/roles";
import OperationManagement from "./OperationManagement";
import StaffOperationManagement from "./StaffOperationManagement";

const OperationsListWrapper = () => {
    const { user } = useAuthContext();
    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

    if (isAdmin) {
        return <OperationManagement />;
    }

    return <StaffOperationManagement />;
};

export default OperationsListWrapper;
