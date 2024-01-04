package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.service.RoleService;
import org.verduttio.dominicanappbackend.service.exception.RoleExistsByNameException;

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

    @GetMapping("/{roleId}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long roleId) {
        Role role = roleService.getRoleById(roleId);
        return role != null
                ? new ResponseEntity<>(role, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody Role role) {
        try {
            roleService.saveRole(role);
        } catch (RoleExistsByNameException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return new ResponseEntity<>(role, HttpStatus.CREATED);
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<?> updateRole(@PathVariable Long roleId, @RequestBody Role updatedRole) {
        Role existingRole = roleService.getRoleById(roleId);
        if (existingRole != null) {
            return updateRoleIfExist(updatedRole, existingRole);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long roleId) {
        roleService.deleteRole(roleId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private ResponseEntity<?> updateRoleIfExist(Role updatedRole, Role existingRole) {
        try {
            roleService.updateRole(updatedRole, existingRole);
        } catch (RoleExistsByNameException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return new ResponseEntity<>(existingRole, HttpStatus.OK);
    }
}
