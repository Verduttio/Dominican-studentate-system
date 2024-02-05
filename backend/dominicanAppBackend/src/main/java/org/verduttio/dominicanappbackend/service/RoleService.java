package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.RoleType;
import org.verduttio.dominicanappbackend.repository.RoleRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.util.*;

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
           throw new EntityAlreadyExistsException("Role with given name already exists");
        }
        roleRepository.save(role);
    }

    public void updateRole(Long roleId, Role updatedRole) {
        Optional<Role> roleOptional = roleRepository.findById(roleId);
        if (roleOptional.isEmpty()) {
            throw new EntityNotFoundException("Role with given id does not exist");
        }
        Role existingRole = roleOptional.get();

        if (existsAnotherRoleWithGivenName(updatedRole.getName(), existingRole.getName())) {
            throw new EntityAlreadyExistsException("Another role with given name already exists");
        }
        existingRole.setName(updatedRole.getName());
        existingRole.setType(updatedRole.getType());
        roleRepository.save(existingRole);
    }

    public void deleteRole(Long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new EntityNotFoundException("Role with given id does not exist");
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
            if(roleDB != null) {
                rolesDB.add(roleDB);
            }
        }

        return rolesDB;
    }

    public Optional<Role> findByNameAndType(String roleName, RoleType roleType) {
        return roleRepository.findByNameAndType(roleName, roleType);
    }

    public List<Role> getAllRolesWithout(String... roleNames) {
        List<Role> allRoles = new LinkedList<Role>(getAllRoles());
        for (String roleName : roleNames) {
            allRoles.removeIf(role -> role.getName().equals(roleName));
        }
        return allRoles;
    }

    private boolean existsAnotherRoleWithGivenName(String newName, String currentName) {
        return roleRepository.existsByName(newName) && !newName.equals(currentName);
    }

    public List<Role> getRolesByType(RoleType roleType) {
        return roleRepository.findByType(roleType);
    }
}
