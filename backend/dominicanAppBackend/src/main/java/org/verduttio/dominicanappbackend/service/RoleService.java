package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.repository.RoleRepository;
import org.verduttio.dominicanappbackend.service.exception.RoleAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.RoleNotFoundException;

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
        if (roleRepository.existsByName(role.getName())) {
           throw new RoleAlreadyExistsException("Role with given name already exists");
        }
        roleRepository.save(role);
    }

    public void updateRole(Role updatedRole, Role existingRole) {
        if (existsAnotherRoleWithGivenName(updatedRole.getName(), existingRole.getName())) {
            throw new RoleAlreadyExistsException("Another role with given name already exists");
        }
        existingRole.setName(updatedRole.getName());
        roleRepository.save(existingRole);
    }

    public void deleteRole(Long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new RoleNotFoundException("Role with given id does not exist");
        }
        roleRepository.deleteById(roleId);
    }

    /**
     * Retrieves a set of roles based on the provided role names.
     *
     * @param roleNames A set of role names for which role objects should be retrieved.
     * @return A set of role objects corresponding to the given role names. If a role with a particular name is not found,
     *         an empty set is returned.
     */
    public Set<Role> getRolesByRoleNames(Set<String> roleNames) {
        Set<Role> rolesDB = new HashSet<>();
        if (roleNames == null || roleNames.isEmpty()) {
            return rolesDB;
        }

        for (String roleName : roleNames) {
            Role roleDB = getRoleByName(roleName);
            rolesDB.add(roleDB);
        }

        return rolesDB;
    }

    private boolean existsAnotherRoleWithGivenName(String newName, String currentName) {
        return roleRepository.existsByName(newName) && !newName.equals(currentName);
    }

}
