package com.networkchecker.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckResponse {
    private String host;
    private boolean reachable;
    private String commandOutput;
}
