  import express from 'express';
  import session from 'express-session';
  import bodyParser from 'body-parser';
  import FileStore from 'session-file-store';

  // セッションの型定義を拡張
  declare module 'express-session' {
    interface SessionData {
      user?: string;
      email?: string;
      comment?: string;
    }
  }

  const app = express();
  const port = process.env.PORT || 3000;

  // ファイルベースのセッションストアを作成
  const FileStoreSession = FileStore(session);

  app.use(session({
    store: new FileStoreSession({
      path: './sessions',
      ttl: 86400, // 24時間
      reapInterval: 3600, // 1時間ごとにクリーンアップ
    }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static('public'));

  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/login');
    }
  }

  // ログインページ
  app.get('/login', (req, res) => {
    res.send(`
      <form action="/login" method="post">
        <input type="text" name="username" placeholder="ユーザー名" required />
        <input type="password" name="password" placeholder="パスワード" required />
        <button type="submit">ログイン</button>
      </form>
    `);
  });

  // ログイン処理
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'user' && password === 'password') {
      req.session.user = username;
      res.redirect('/profile');
    } else {
      res.redirect('/login');
    }
  });

  // プロフィール画面（認証が必要）
  app.get('/profile', requireAuth, (req, res) => {
    // セッションから最新のデータを取得
    const currentEmail = req.session.email || '未設定';
    const currentComment = req.session.comment || 'コメントなし';
    
    res.send(`
      <h1>プロフィール</h1>
      <p>ようこそ、${req.session.user}さん</p>
      
      <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>📧 現在のメールアドレス</h3>
        <p style="font-size: 18px; color: #333;"><strong>${currentEmail}</strong></p>
        
        <h3>💬 最新のコメント</h3>
        <p style="font-size: 16px; color: #666;">${currentComment}</p>
      </div>

      <!-- CSRF脆弱性のあるフォーム -->
      <div style="border: 2px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>✏️ プロフィール更新</h3>
        <form action="/update-profile" method="post">
          <input type="text" name="email" placeholder="メールアドレス" required style="width: 100%; padding: 10px; margin: 5px 0;" />
          <button type="submit" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">プロフィールを更新</button>
        </form>
      </div>

      <!-- コメント投稿フォーム -->
      <div style="border: 2px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>💭 コメント投稿</h3>
        <form action="/post-comment" method="post">
          <textarea name="comment" placeholder="コメントを入力" required style="width: 100%; padding: 10px; margin: 5px 0; height: 80px;"></textarea>
          <button type="submit" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">コメントする</button>
        </form>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <h4>⚠️ CSRF攻撃のテスト方法</h4>
        <p>1. このページでログイン状態を維持</p>
        <p>2. 別タブで <a href="http://localhost:3001" target="_blank">罠ページ</a> を開く</p>
        <p>3. 罠ページのボタンをクリック</p>
        <p>4. このページに戻って、データが勝手に更新されていることを確認</p>
      </div>
    `);
  });

  // プロフィール更新処理（脆弱性あり）
  app.post('/update-profile', requireAuth, (req, res) => {
    const { email } = req.body;
    req.session.email = email; // セッションに保存
    console.log(`${req.session.user}のメールアドレスを${email}に更新しました`);
    res.send(`プロフィールが更新されました。<a href="/profile">プロフィール画面に戻る</a>`);
  });

  // コメント投稿処理（脆弱性あり）
  app.post('/post-comment', requireAuth, (req, res) => {
    const { comment } = req.body;
    req.session.comment = comment; // セッションに保存
    console.log(`${req.session.user}がコメントしました: ${comment}`);
    res.send(`コメントが投稿されました。<a href="/profile">プロフィール画面に戻る</a>`);
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });