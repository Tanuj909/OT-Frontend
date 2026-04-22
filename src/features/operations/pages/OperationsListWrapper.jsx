import React from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { ROLES } from "../../../shared/constants/roles";
import OperationManagement from "./OperationManagement";
import StaffOperationManagement from "./StaffOperationManagement";

const OperationsListWrapper = () => {
    const { user } = useAuthContext();
    const isManagementRole = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.RECEPTIONIST, ROLES.BILLING_INCHARGE, ROLES.DOCTOR].includes(user?.role);

    if (isManagementRole) {
        return <OperationManagement />;
    }

    return <StaffOperationManagement />;
};

export default OperationsListWrapper;
