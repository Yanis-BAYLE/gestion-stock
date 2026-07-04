package com.example.backend.security;

import com.example.backend.entity.AppUser;
import com.example.backend.entity.Role;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DevUserSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DevUserSeeder(
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createUserIfMissing("admin@example.com", "admin123", "ADMIN");
        createUserIfMissing("manager@example.com", "manager123", "GESTIONNAIRE");
        createUserIfMissing("reader@example.com", "reader123", "LECTEUR");
    }

    private void createUserIfMissing(String email, String password, String roleName) {
        if (appUserRepository.existsByEmail(email)) {
            return;
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Rôle introuvable : " + roleName));

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);

        appUserRepository.save(user);
    }
}