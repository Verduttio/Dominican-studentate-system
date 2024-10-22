package org.verduttio.dominicanappbackend.security;

import org.springframework.security.core.GrantedAuthority;
import org.verduttio.dominicanappbackend.domain.Role;

public class RoleGrantedAuthorityAdapter implements GrantedAuthority {
    private final Role role;

    public RoleGrantedAuthorityAdapter(Role role) {
        this.role = role;
    }

    @Override
    public String getAuthority() {
        return role.getName();
    }
}

