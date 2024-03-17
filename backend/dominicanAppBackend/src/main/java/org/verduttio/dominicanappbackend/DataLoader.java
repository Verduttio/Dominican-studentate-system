package org.verduttio.dominicanappbackend;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.entity.AuthProvider;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.RoleType;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.RoleRepository;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.util.Set;

@Component
public class DataLoader implements ApplicationRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public DataLoader(RoleRepository roleRepository, UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }


    @Override
    public void run(ApplicationArguments args) throws Exception {
        loadRoles();
        loadUsers();
    }

    private void loadRoles() {
        if(roleRepository.findByName("ROLE_USER").isEmpty()) roleRepository.save(new Role("ROLE_USER", RoleType.SYSTEM));
        if(roleRepository.findByName("ROLE_FUNKCYJNY").isEmpty()) roleRepository.save(new Role("ROLE_FUNKCYJNY", RoleType.SYSTEM));
    }

    private void loadUsers() {
        if(userRepository.findByEmail("admin@mail.com").isEmpty()) {
            Role user = roleRepository.findByName("ROLE_USER").get();
            Role funkcyjny = roleRepository.findByName("ROLE_FUNKCYJNY").get();
            Set<Role> roles = Set.of(user, funkcyjny);
            User adminUser = new User("admin@mail.com", bCryptPasswordEncoder.encode("12345678"),
                    roles, "Frank", "Cadillac", AuthProvider.LOCAL, true);

            userRepository.save(adminUser);
        }

    }


}
