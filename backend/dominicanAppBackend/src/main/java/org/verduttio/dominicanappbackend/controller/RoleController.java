package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.service.RoleService;

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
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        roleService.saveRole(role);
        return new ResponseEntity<>(role, HttpStatus.CREATED);
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<Role> updateRole(@PathVariable Long roleId, @RequestBody Role updatedRole) {
        Role existingRole = roleService.getRoleById(roleId);
        if (existingRole != null) {
            existingRole.setName(updatedRole.getName());
            //TODO: Set other fields as needed

            roleService.saveRole(existingRole);
            return new ResponseEntity<>(existingRole, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long roleId) {
        roleService.deleteRole(roleId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
