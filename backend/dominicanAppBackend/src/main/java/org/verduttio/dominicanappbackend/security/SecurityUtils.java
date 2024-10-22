package org.verduttio.dominicanappbackend.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.verduttio.dominicanappbackend.domain.User;

public class SecurityUtils {
    public static final String ACCESS_DENIED_MESSAGE = "You are not allowed to make this operation";

    public static boolean isUserOwnerOrAdmin(Long ownerId) {
        return isUserOwnerOrHasSpecificRole(ownerId, "ROLE_ADMIN");
    }

    public static boolean isUserOwnerOrSupervisor(Long ownerId) {
        return isUserOwnerOrHasSpecificRole(ownerId, "ROLE_SUPERVISOR");
    }

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getUser();
    }

    public static boolean userHasRoleAdmin() {
        return userHasRole("ROLE_ADMIN");
    }

    private static boolean userHasRole(String roleName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(roleName));
    }

    private static boolean isUserOwnerOrHasSpecificRole(Long ownerId, String roleName) {
        User currentUser = getCurrentUser();

        if (currentUser.getRoles().stream().anyMatch(role -> role.getName().equals(roleName))
                || currentUser.getId().equals(ownerId)) {
            return true;
        } else {
            throw new AccessDeniedException("You are not allowed to make this operation");
        }
    }
}
