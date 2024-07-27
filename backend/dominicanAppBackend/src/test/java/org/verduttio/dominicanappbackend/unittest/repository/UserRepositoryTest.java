package org.verduttio.dominicanappbackend.unittest.repository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ExtendWith(SpringExtension.class)
@ActiveProfiles("integration_tests")
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testFindByEmail() {
        String email = "test@example.com";
        User expectedUser = new User();
        expectedUser.setEmail(email);
        userRepository.save(expectedUser);

        Optional<User> actualUser = userRepository.findByEmail(email);

        assertThat(actualUser).isPresent().contains(expectedUser);
    }

    @Test
    public void testExistsByEmail() {
        String email = "test@example.com";
        User user = new User();
        user.setEmail(email);
        userRepository.save(user);

        boolean exists = userRepository.existsByEmail(email);

        assertThat(exists).isTrue();
    }

    @Test
    public void testExistsById() {
        User user = new User();
        user = userRepository.save(user);
        Long userId = user.getId();

        boolean exists = userRepository.existsById(userId);

        assertThat(exists).isTrue();
    }

    @Test
    public void testFindAllUsersShortInfo() {
        User user1 = new User();
        user1.setName("John");
        user1.setSurname("Doe");
        user1 = userRepository.save(user1);

        User user2 = new User();
        user2.setName("Jane");
        user2.setSurname("Smith");
        user2 = userRepository.save(user2);

        List<UserShortInfo> expectedUserShortInfos = Arrays.asList(
                new UserShortInfo(1L, user1.getName(), user1.getSurname()),
                new UserShortInfo(2L, user2.getName(), user2.getSurname())
        );

        List<UserShortInfo> actualUserShortInfos = userRepository.findAllUsersShortInfo();

        assertThat(actualUserShortInfos).isEqualTo(expectedUserShortInfos);
    }

    @Test
    public void testCountByNotEnabled() {
        User user = new User();
        user.setEnabled(false);
        userRepository.save(user);

        Long actualCount = userRepository.countByNotEnabled();

        assertThat(actualCount).isEqualTo(1L);
    }

    @Test
    public void testFindByEmailWithNonExistingEmail() {
        String email = "nonexisting@example.com";

        Optional<User> actualUser = userRepository.findByEmail(email);

        assertThat(actualUser).isNotPresent();
    }

    @Test
    public void testExistsByEmailWithNonExistingEmail() {
        String email = "nonexisting@example.com";

        boolean exists = userRepository.existsByEmail(email);

        assertThat(exists).isFalse();
    }

    @Test
    public void testExistsByIdWithNonExistingId() {
        Long userId = 999L;

        boolean exists = userRepository.existsById(userId);

        assertThat(exists).isFalse();
    }

    @Test
    public void testFindAllUsersShortInfoWithEmptyResult() {
        List<UserShortInfo> actualUserShortInfos = userRepository.findAllUsersShortInfo();

        assertThat(actualUserShortInfos).isEmpty();
    }

    @Test
    public void testFindAllWhichHaveAnyOfRolesWithEmptyResult() {
        List<String> roleNames = List.of("ROLE_NONEXISTENT");

        List<User> actualUsers = userRepository.findAllWhichHaveAnyOfRoles(roleNames);

        assertThat(actualUsers).isEmpty();
    }

    @Test
    public void testCountByNotEnabledWithZeroResult() {
        Long actualCount = userRepository.countByNotEnabled();

        assertThat(actualCount).isEqualTo(0L);
    }
}
