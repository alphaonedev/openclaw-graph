---
name: cs-os
cluster: computer-science
description: "OS: processes/threads/fibers, CFS scheduling, virtual memory, file systems, IPC, syscalls, POSIX"
tags: ["os","processes","memory","filesystems","cs"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "operating system process thread memory filesystem syscall ipc posix"
---

## Purpose
This skill equips the AI to generate code, explain concepts, and handle tasks related to operating system fundamentals, focusing on processes, threads, fibers, Completely Fair Scheduler (CFS), virtual memory, file systems, inter-process communication (IPC), syscalls, and POSIX standards. Use it to produce accurate, executable code snippets or detailed explanations for OS-related queries.

## When to Use
Apply this skill for user queries involving process management (e.g., forking processes), thread synchronization, memory allocation via virtual memory APIs, file system operations like mounting or reading directories, IPC mechanisms such as pipes or sockets, or POSIX-compliant syscalls. Use it in coding scenarios like building a multi-threaded server or debugging memory leaks.

## Key Capabilities
- Processes: Handle creation with fork(), termination via waitpid(), and management using exec() family functions with flags like EXEC_ENV.
- Threads/Fibers: Create threads via pthread_create() with attributes like pthread_attr_t, and fibers using user-space libraries like Boost.Context.
- CFS Scheduling: Explain CFS algorithms, including how it uses virtual runtime (vruntime) for fairness; generate code to simulate scheduling with sleep() and getpriority().
- Virtual Memory: Manage mappings with mmap() using flags like MAP_PRIVATE, and unmap with munmap(); handle page faults via mprotect() with PROT_NONE.
- File Systems: Perform operations like open() with O_CREAT|O_EXCL flags, read/write with specific offsets, and directory traversal using opendir()/readdir().
- IPC: Implement pipes with pipe() array, message queues via msgget()/msgsnd(), and sockets with socket(AF_INET, SOCK_STREAM, 0).
- Syscalls: Wrap POSIX syscalls like getpid() or kill() in C code, ensuring error checking with errno.
- POSIX: Ensure compliance by using standards like POSIX.1 for threads and file I/O, with code adhering to real-time extensions.

## Usage Patterns
Invoke this skill by prefixing queries with the skill ID, e.g., "cs-os: Write code to fork a process". Always specify context, like "cs-os: Explain CFS with a C simulation". For code generation, request outputs in C or C++ with POSIX headers. Pattern: Query -> AI generates 2-4 line snippets -> AI explains usage. For multi-step tasks, chain with other skills, e.g., first use cs-os for process code, then integrate with a networking skill. Test generated code in a POSIX environment like Linux.

## Common Commands/API
- Processes: Use fork() to create a child; example: `pid_t pid = fork(); if (pid == 0) execl("/bin/echo", "echo", "Child", NULL);`
- Threads: Call pthread_create() with a thread function; example: `pthread_t thread; pthread_create(&thread, NULL, my_function, NULL); pthread_join(thread, NULL);`
- CFS Scheduling: Simulate with sched_setscheduler() and SCHED_OTHER policy; example: `struct sched_param param; sched_setscheduler(0, SCHED_FIFO, &param);`
- Virtual Memory: Map memory with mmap(); example: `void *mem = mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_ANON|MAP_PRIVATE, -1, 0); if (mem == MAP_FAILED) exit(1);`
- File Systems: Open files with open(); example: `int fd = open("file.txt", O_RDWR|O_CREAT, 0644); write(fd, buffer, size); close(fd);`
- IPC: Create a pipe; example: `int pipefd[2]; pipe(pipefd); write(pipefd[1], "Message", 7); read(pipefd[0], buffer, 7);`
- Syscalls: Use getpid(); example: `pid_t mypid = getpid(); printf("PID: %d\n", mypid);`
- POSIX: For threads, use pthread_mutex_lock(); example: `pthread_mutex_t mutex; pthread_mutex_lock(&mutex); /* Critical section */ pthread_mutex_unlock(&mutex);`
If authentication is needed for external OS tools (e.g., cloud-based VMs), set env vars like `$OS_API_KEY` for API calls, but POSIX syscalls typically don't require it.

## Integration Notes
Integrate this skill into your AI workflow by calling it via the skill ID in response handlers, e.g., in a Python script: `response = ai_invoke('cs-os', query='Generate fork code')`. Ensure the environment is POSIX-compliant (e.g., Ubuntu) and include necessary headers like `<unistd.h>` or `<pthread.h>` in generated code. For config formats, use JSON for simulation parameters, e.g., `{"process_count": 5, "memory_size": 1024}`. If combining with other skills, pass outputs as inputs, like using cs-os generated code in a cs-networking skill for IPC over sockets. Always compile and test snippets with gcc -o output.c -lpthread.

## Error Handling
For syscalls, always check return values and use errno; example: `if (fork() == -1) { perror("Fork error"); exit(errno); }`. For threads, handle pthread errors with pthread_create's return code: `if (pthread_create(&thread, NULL, func, NULL) != 0) { fprintf(stderr, "Thread creation failed\n"); }`. In file operations, verify fd: `if (open("file.txt", O_RDONLY) == -1) { errno_check(); }`. Use strerror(errno) for messages. For IPC, check queue IDs: `if (msgget(key, 0666) == -1) { handle_error("msgget"); }`. In code generation, instruct the AI to include try-catch in higher-level wrappers or exit gracefully in C.

## Concrete Usage Examples
1. Usage: User asks to manage a process for logging. Invoke: "cs-os: Write code to fork a child process that logs to a file." AI response: Generate and explain: `pid_t pid = fork(); if (pid == 0) { int fd = open("log.txt", O_WRONLY|O_CREAT, 0644); write(fd, "Log entry", 9); close(fd); } else { waitpid(pid, NULL, 0); }` Then, advise testing with `./program` on Linux.
2. Usage: User queries virtual memory for a cache. Invoke: "cs-os: Explain CFS and code for mapping memory." AI response: "CFS uses vruntime for scheduling; here's memory mapping: void *cache = mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_SHARED|MAP_ANONYMOUS, -1, 0); if (munmap(cache, 8192) == -1) perror('Unmap failed');" Follow with: Compile and run to verify no segmentation faults.

## Graph Relationships
- Related to cluster: computer-science
- Shares tags: os, processes, memory, filesystems, cs, ipc, syscall, posix
- Connected skills: cs-networking (via IPC sockets), cs-algorithms (via scheduling simulations)
