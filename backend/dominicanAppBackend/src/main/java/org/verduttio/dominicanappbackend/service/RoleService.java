package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.repository.RoleRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(Long roleId) {
        return roleRepository.findById(roleId).orElse(null);
    }

    public Role getRoleByName(String roleName) {
        return roleRepository.findByName(roleName).orElse(null);
    }

    public void saveRole(Role role) {
        roleRepository.save(role);
    }

    public void deleteRole(Long roleId) {
        roleRepository.deleteById(roleId);
    }

    public Set<Role> getRolesByRoleNames(Set<String> roleNames) {
        Set<Role> rolesDB = new HashSet<>();
        if (roleNames == null) {
            return rolesDB;
        }

        for (String roleName : roleNames) {
            Role roleDB = getRoleByName(roleName);
            rolesDB.add(roleDB);
        }

        return rolesDB;
    }

}
