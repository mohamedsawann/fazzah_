#!/usr/bin/env node
require("child_process").spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
});
