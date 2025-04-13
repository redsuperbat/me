---
title: Rustproof - Extensible code spellchecker written in rust
description: Spellchecking code is nice. After not having much luck with other spellcheckers I wrote my own.
languages:
  - Rust
date: 2025-04-04
updated: 2025-04-13
---

# Rustproof

[Rustproof github repo](https://github.com/redsuperbat/rustproof)

Spelling is hard, especially when you're writing text all day long and the
value you provide isn't measured by the conciseness of your code but rather its
correctness.

For a developer, spelling is just the icing on the cake. Regardless it's nice
not to have to read spelling mistakes all day.

Since my code always conveys proper intent 💁 and I was struggling with the
spelling part, I decided to use a spellchecker for my code.

I started by using cspell, a fairly popular spellchecker that uses LSP to
communicate spelling errors to my editor. It worked fine for most files, but it
sometimes became unhinged when files were over 1000 lines, with the CPU hitting
100% and memory usage skyrocketing. At some point, I had to add a file size
check to my LSP config in Neovim to explicitly prevent cspell from running on
large files. 😮‍💨

Adding additional languages was also a pain. I'm Swedish and maintain some
websites with Swedish copy, which was unknowingly littered with spelling
errors. I tried adding the Swedish cspell dictionary, but after an hour of
searching and trial and error, I gave up and opted to disable cspell LSP in
projects with Swedish copy.

After some time, I stumbled upon [harper-ls](https://writewithharper.com/), a
fantastic project I thought would solve all my problems. However, it fell short
since it could only spellcheck comments and markdown, essentially addressing a
different need than what cspell was doing.

Therefore, I decided to create my own code spellchecker, and rustproof was
born.

Rustproof has a simple architecture very common to how cspell works but
leverages [hunspell](https://hunspell.github.io) in order to spellcheck words.
This allows Rustproof to load dictionaries from any language supported by
hunspell. Below you can see a demonstration of the LSP in action:

<img src="https://github.com/user-attachments/assets/ad313dcb-fac7-4df7-afbb-47f95ecf2e2f" />
