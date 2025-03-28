package com.networkchecker.networkService;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class NetService {

    public String executeSshCommand(String host, String user, String password, String command) throws Exception {
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
