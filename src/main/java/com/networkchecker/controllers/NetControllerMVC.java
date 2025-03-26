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
        return "index";
    }
}
