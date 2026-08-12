class NotificationExtension {
  getInfo() {
    return {
      id: 'notification',
      name: 'Notification',
      blocks: [
        {
          opcode: 'sendNotification',
          blockType: Scratch.BlockType.COMMAND,
          text: 'send notification [TEXT] with icon [ICON_URL]',
          arguments: {
            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hi, this is notification!' },
            ICON_URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://dashblocks.org/favicon.ico' }
          }
        }
      ]
    };
  }

  sendNotification(args) {
    if (!("Notification" in window)) {
      console.log("This browser doesn't supports notifications.");
      return;
    }
    if (Notification.permission === "granted") {
      new Notification(args.TEXT || "No text", { icon: args.ICON_URL || undefined });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(args.TEXT, {icon: args.ICON_URL});
        }
      });
    }
  }
}
Scratch.extensions.register(new NotificationExtension());