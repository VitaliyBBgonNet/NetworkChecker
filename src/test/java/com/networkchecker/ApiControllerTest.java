package com.networkchecker;

import com.networkchecker.controllers.NetworkControllerREST;
import com.networkchecker.dto.CheckResponse;
import com.networkchecker.networkService.NetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.InetAddress;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ApiControllerTest {

    @InjectMocks
    private NetworkControllerREST controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void checkHost_withNoHost_shouldReturnUnreachable() throws Exception {
        CheckResponse response = controller.checkHost(null, null, null, null);

        assertEquals("No host provided", response.getHost());
        assertFalse(response.isReachable());
        assertNull(response.getCommandOutput());
    }

    @Test
    void checkHost_withValidCredentials_shouldReturnCommandOutput() throws Exception {
        NetService netService = mock(NetService.class);
        NetworkControllerREST controller = new NetworkControllerREST(netService);

        try (MockedStatic<InetAddress> mockedInet = Mockito.mockStatic(InetAddress.class)) {

            InetAddress mockAddress = mock(InetAddress.class);
            when(mockAddress.isReachable(anyInt())).thenReturn(true);
            mockedInet.when(() -> InetAddress.getByName("valid.host"))
                    .thenReturn(mockAddress);

            when(netService.executeSshCommand(
                    eq("valid.host"),
                    eq("user"),
                    eq("pass"),
                    eq("uptime")))
                    .thenReturn("command output");

            CheckResponse response = controller.checkHost("valid.host", "user", "pass", "uptime");

            assertEquals("valid.host", response.getHost());
            assertTrue(response.isReachable());
            assertEquals("command output", response.getCommandOutput());
        }
    }
}
