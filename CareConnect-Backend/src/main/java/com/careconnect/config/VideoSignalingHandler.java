package com.careconnect.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class VideoSignalingHandler extends TextWebSocketHandler {

    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String bookingId = getBookingId(session);
        if (bookingId != null) {
            rooms.computeIfAbsent(bookingId, key -> new CopyOnWriteArraySet<>()).add(session);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String bookingId = getBookingId(session);
        if (bookingId == null) return;

        Set<WebSocketSession> roomSessions = rooms.get(bookingId);
        if (roomSessions != null) {
            for (WebSocketSession s : roomSessions) {
                if (s.isOpen() && !s.getId().equals(session.getId())) {
                    s.sendMessage(message);
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String bookingId = getBookingId(session);
        if (bookingId != null) {
            Set<WebSocketSession> roomSessions = rooms.get(bookingId);
            if (roomSessions != null) {
                roomSessions.remove(session);
                if (roomSessions.isEmpty()) {
                    rooms.remove(bookingId);
                }
            }
        }
    }

    private String getBookingId(WebSocketSession session) {
        String query = session.getUri() != null ? session.getUri().getQuery() : null;
        if (query != null && query.contains("bookingId=")) {
            for (String param : query.split("&")) {
                if (param.startsWith("bookingId=")) {
                    return param.substring("bookingId=".length());
                }
            }
        }
        return "default";
    }
}
