package com.networkchecker.controllers;

import com.networkchecker.dto.CheckResponse;
import com.networkchecker.networkService.NetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.InetAddress;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:8080", methods = {RequestMethod.GET, RequestMethod.POST})
public class NetworkControllerREST {

    private final NetService netService;

    @GetMapping("/check")
    public CheckResponse checkHost(
            @RequestParam(required = false) String host,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String password,
            @RequestParam(required = false, defaultValue = "uptime") String command) throws Exception {
        CheckResponse response = new CheckResponse();

        if (host == null || host.trim().isEmpty()) {
            response.setHost("No host provided");
            response.setReachable(false);
            return response;
        }

        response.setHost(host);
        InetAddress address = InetAddress.getByName(host);
        boolean reachable = address.isReachable(5000);
        response.setReachable(reachable);

        if (user != null && password != null && reachable) {
            String commandOutput = netService.executeSshCommand(host, user, password, command);
            response.setCommandOutput(commandOutput != null ? commandOutput.trim() : null);
        }

        return response;
    }

    @Value("${spring.servlet.multipart.max-file-size}")
    private long maxFileSize;

    @PostMapping("/upload")
    public ResponseEntity<String> handleUpload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        if (file.getSize() > maxFileSize) {
            return ResponseEntity.badRequest().body("File is too large");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("text/")) {
            return ResponseEntity.badRequest().body("Only text files are allowed");
        }

        return ResponseEntity.ok("Upload successful");
    }
}