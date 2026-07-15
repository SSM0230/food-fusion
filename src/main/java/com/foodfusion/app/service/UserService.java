package com.foodfusion.app.service;

import com.foodfusion.app.entity.Address;
import com.foodfusion.app.entity.User;
import com.foodfusion.app.repository.AddressRepository;
import com.foodfusion.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    public User register(String username, String password, String email, String role, LocalDate birthday) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        User user = User.builder()
                .username(username)
                .password(password) // Note: In production, password should be hashed (e.g. BCrypt)
                .email(email)
                .role(role.toUpperCase())
                .birthday(birthday)
                .loyaltyPoints(10) // Welcome bonus points
                .loyaltyLevel("BRONZE")
                .build();
        return userRepository.save(user);
    }

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!user.isActive()) {
            throw new RuntimeException("Account is disabled by administrator.");
        }
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUserProfile(Long userId, String email, LocalDate birthday) {
        User user = getUserById(userId);
        user.setEmail(email);
        user.setBirthday(birthday);
        return userRepository.save(user);
    }

    public User changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);
        if (!user.getPassword().equals(oldPassword)) {
            throw new RuntimeException("Incorrect old password");
        }
        user.setPassword(newPassword);
        return userRepository.save(user);
    }

    @Transactional
    public void addLoyaltyPoints(Long userId, int points) {
        User user = getUserById(userId);
        int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
        int newPoints = currentPoints + points;
        user.setLoyaltyPoints(newPoints);

        // Calculate Level
        if (newPoints > 1000) {
            user.setLoyaltyLevel("PLATINUM");
        } else if (newPoints > 500) {
            user.setLoyaltyLevel("GOLD");
        } else if (newPoints > 100) {
            user.setLoyaltyLevel("SILVER");
        } else {
            user.setLoyaltyLevel("BRONZE");
        }
        userRepository.save(user);
    }

    // --- Delivery Addresses ---
    public List<Address> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public Address addAddress(Long userId, String addressLine, String city, String zipCode) {
        User user = getUserById(userId);
        List<Address> existing = addressRepository.findByUserId(userId);
        boolean isDefault = existing.isEmpty(); // default if it's the first one

        Address address = Address.builder()
                .user(user)
                .addressLine(addressLine)
                .city(city)
                .zipCode(zipCode)
                .isDefault(isDefault)
                .build();
        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        addressRepository.delete(address);

        // If we deleted the default, set another one as default
        List<Address> remaining = addressRepository.findByUserId(userId);
        if (!remaining.isEmpty() && address.isDefault()) {
            Address first = remaining.get(0);
            first.setDefault(true);
            addressRepository.save(first);
        }
    }

    @Transactional
    public void setDefaultAddress(Long addressId, Long userId) {
        List<Address> list = addressRepository.findByUserId(userId);
        boolean found = false;
        for (Address addr : list) {
            if (addr.getId().equals(addressId)) {
                addr.setDefault(true);
                addressRepository.save(addr);
                found = true;
            } else {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
        if (!found) {
            throw new RuntimeException("Address not found or unauthorized");
        }
    }
}
