package com.networkchecker.controllers;

import com.networkchecker.dto.CheckResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetAddress;

@RestController
public class NetworkControllerREST {

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
            String commandOutput = executeSshCommand(host, user, password, command);
            response.setCommandOutput(commandOutput != null ? commandOutput.trim() : null);
        }

        return response;
    }

    private String executeSshCommand(String host, String user, String password, String command) throws Exception {
        try {
            com.jcraft.jsch.JSch jsch = new com.jcraft.jsch.JSch();
            com.jcraft.jsch.Session session = jsch.getSession(user, host, 22);
            session.setPassword(password);
            session.setConfig("StrictHostKeyChecking", "no");
            session.connect(5000);

            com.jcraft.jsch.ChannelExec channel = (com.jcraft.jsch.ChannelExec) session.openChannel("exec");
            channel.setCommand(command);
            java.io.InputStream in = channel.getInputStream();
            channel.connect();

            byte[] buffer = new byte[1024];
            int len = in.read(buffer);
            String result = len > 0 ? new String(buffer, 0, len) : null;

            channel.disconnect();
            session.disconnect();
            return result;
        } catch (Exception e) {
            return null;
        }
    }
}