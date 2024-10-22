package org.verduttio.dominicanappbackend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.role.RoleSortOrderUpdateDTO;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.RoleType;
import org.verduttio.dominicanappbackend.service.RoleService;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.SensitiveEntityException;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    @Autowired
    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    @GetMapping(params = "areTasksVisibleInPrints")
    public ResponseEntity<List<Role>> getAllRolesByAreTasksVisibleInPrints(@RequestParam boolean areTasksVisibleInPrints) {
        List<Role> roles = roleService.getRolesByAreTasksVisibleInPrints(areTasksVisibleInPrints);
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }


    @GetMapping("/types/{roleType}")
    public ResponseEntity<List<Role>> getRolesByType(@PathVariable RoleType roleType) {
        List<Role> roles = roleService.getRolesByType(roleType);
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long roleId) {
        Role role = roleService.getRoleById(roleId);
        return role != null
                ? new ResponseEntity<>(role, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<?> createRole(@Valid @RequestBody Role role) {
        try {
            roleService.saveRole(role);
        } catch (EntityAlreadyExistsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(role, HttpStatus.CREATED);
    }

    @PatchMapping
    public ResponseEntity<?> updateRoleSortOrder(@RequestBody List<RoleSortOrderUpdateDTO> roleSortOrderUpdateDTOs) {
        try {
            roleService.updateRoleSortOrder(roleSortOrderUpdateDTOs);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PatchMapping("/visibilityInPrint")
    public ResponseEntity<?> updateRoleTasksVisibilityInPrint(@RequestBody List<Long> roleIds) {
        try {
            roleService.updateRoleTasksVisibilityInPrint(roleIds);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<?> updateRole(@PathVariable Long roleId, @Valid @RequestBody Role updatedRole) {
        try {
            roleService.updateRole(roleId, updatedRole);
        } catch (EntityAlreadyExistsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (SensitiveEntityException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<?> deleteRole(@PathVariable Long roleId) {
        try {
            roleService.deleteRole(roleId);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (SensitiveEntityException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
