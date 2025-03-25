package com.networkchecker.controllers;

import com.networkchecker.dto.CheckResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;

@Controller
public class NetControllerMVC {
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/")
    public String showForm() {
        return "check";
    }

    @PostMapping("/check")
    public String checkHost(
            @RequestParam(required = false) String host,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String password,
            @RequestParam(required = false, defaultValue = "uptime") String command,
            Model model) {

        if (host == null || host.trim().isEmpty()) {
            CheckResponse response = new CheckResponse();
            response.setHost("No host provided");
            response.setReachable(false);
            model.addAttribute("response", response);
            return "check";
        }

        String apiUrl = "http://localhost:8080/api/check?host=" + host;
        if (user != null && !user.isEmpty()) {
            apiUrl += "&user=" + user;
        }
        if (password != null && !password.isEmpty()) {
            apiUrl += "&password=" + password;
        }
        apiUrl += "&command=" + command;

        try {
            CheckResponse response = restTemplate.getForObject(apiUrl, CheckResponse.class);
            model.addAttribute("response", response);
        } catch (Exception e) {
            CheckResponse response = new CheckResponse();
            response.setHost(host);
            response.setReachable(false);
            response.setCommandOutput("Error: " + e.getMessage());
            model.addAttribute("response", response);
        }

        return "check";
    }
}
