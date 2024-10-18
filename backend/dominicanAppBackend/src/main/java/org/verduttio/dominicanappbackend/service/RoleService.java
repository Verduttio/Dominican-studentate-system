package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.RoleType;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.RoleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.security.UserSessionService;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.SensitiveEntityException;

import java.util.*;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserSessionService userSessionService;

    @Autowired
    public RoleService(RoleRepository roleRepository, TaskRepository taskRepository, UserRepository userRepository, UserSessionService userSessionService) {
        this.roleRepository = roleRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.userSessionService = userSessionService;
    }

    public List<Role> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        roles.sort(Comparator.comparing(Role::getType));
        return roles;
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

        List<String> sensitiveRoleNames = Arrays.asList("ROLE_USER", "ROLE_FUNKCYJNY");
        if(sensitiveRoleNames.contains(existingRole.getName())) {
            throw new SensitiveEntityException("Role with given name cannot be updated");
        }

        if (existsAnotherRoleWithGivenName(updatedRole.getName(), existingRole.getName())) {
            throw new EntityAlreadyExistsException("Another role with given name already exists");
        }
        existingRole.setName(updatedRole.getName());
        existingRole.setType(updatedRole.getType());
        existingRole.setWeeklyScheduleCreatorDefault(updatedRole.isWeeklyScheduleCreatorDefault());
        existingRole.setAssignedTasksGroupName(updatedRole.getAssignedTasksGroupName());
        existingRole.setSortOrder(updatedRole.getSortOrder());
        roleRepository.save(existingRole);
    }

    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId).orElseThrow(
                () -> new EntityNotFoundException("Role with given id does not exist"));

        List<String> sensitiveRoleNames = Arrays.asList("ROLE_USER", "ROLE_FUNKCYJNY", "ROLE_ADMIN");
        if(sensitiveRoleNames.contains(role.getName())) {
            throw new SensitiveEntityException("Role with given name cannot be deleted");
        }

        List<User> usersWithRole = userRepository.findAllWhichHaveAnyOfRoles(Collections.singletonList(role.getName()));
        for (User user : usersWithRole) {
            userSessionService.expireUserSessions(user.getEmail());
        }

        taskRepository.removeRoleFromAllTasks(roleId);
        userRepository.removeRoleFromAllUsers(roleId);
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
        List<Role> allRoles = new LinkedList<>(getAllRoles());
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
