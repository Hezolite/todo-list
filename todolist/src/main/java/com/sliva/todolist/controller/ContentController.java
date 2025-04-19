package com.sliva.todolist.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ContentController {
    @GetMapping("/")
    public String index()
    {
        return "forward:/index.html";
    }
}
