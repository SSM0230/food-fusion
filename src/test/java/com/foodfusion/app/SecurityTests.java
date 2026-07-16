package com.foodfusion.app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

@SpringBootTest
public class SecurityTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    public void publicEndpointsAreAccessible() throws Exception {
        mockMvc.perform(get("/landing.html"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/app"))
                .andExpect(status().isOk());
    }

    @Test
    public void protectedEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    public void customerCannotAccessAdminEndpointsBySecurityRules() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .sessionAttr("userId", 1L)
                        .sessionAttr("role", "CUSTOMER"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void adminCanAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .sessionAttr("userId", 1L)
                        .sessionAttr("role", "ADMIN"))
                .andExpect(status().isOk());
    }
}
