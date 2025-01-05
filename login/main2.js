import express from 'express';
import session from 'express-session';
import { Issuer, generators } from 'openid-client';
import mongoose from 'mongoose';

const app = express();

// 設定 EJS 作為檢視引擎
app.set('view engine', 'ejs');

// MongoDB 連線設定

mongoose.connect('mongodb://localhost:27017/user')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 定義 User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  cognitoId: String  // 加入 Cognito ID 以便追蹤
});

const User = mongoose.model('User', userSchema);

// 設定工作階段中介軟體
app.use(
  session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // 在生產環境使用 HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 小時
    }
  })
);

let client;

// 初始化 OpenID 客戶端
async function initializeClient() {
  try {
    const cognitoDomain = 'https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_odm2LKbPx';
    const issuer = await Issuer.discover(cognitoDomain);
    
    client = new issuer.Client({
      client_id: '17h5f4upjp9nf0u0at0bjpltun',
      client_secret: 'cfgm8jec9aajfkfevp5d4ouleebisaock243brc7nq0r55pf7pu',
      redirect_uris: ['https://papperhelper.xyz'],
      post_logout_redirect_uris: ['https://g11.papperhelper.xyz/logout-success'],
      response_types: ['code'],
    });
    console.log('OpenID Client Initialized Successfully');
  } catch (error) {
    console.error('Error initializing OpenID Client:', error);
    process.exit(1); // 如果初始化失敗，終止應用程式
  }
}

// 在應用啟動時初始化客戶端
initializeClient();

// 驗證中介軟體
const checkAuth = (req, res, next) => {
  req.isAuthenticated = !!req.session.userInfo;
  next();
};

// 錯誤處理中介軟體
const errorHandler = (err, req, res, next) => {
  console.error('Application error:', err);
  res.status(500).render('error', { error: 'An unexpected error occurred' });
};

// 主路由
app.get('/', checkAuth, (req, res) => {
  res.render('home', {
    isAuthenticated: req.isAuthenticated,
    userInfo: req.session.userInfo,
  });
});

// 登入路由
app.get('/login', (req, res) => {
  try {
    const nonce = generators.nonce();
    const state = generators.state();
    
    req.session.nonce = nonce;
    req.session.state = state;
    
    const authUrl = client.authorizationUrl({
      scope: 'openid email phone',
      state: state,
      nonce: nonce,
    });
    
    res.redirect(authUrl);
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/?error=login_failed');
  }
});

// 回呼路由
app.get('/callback', async (req, res) => {
  try {
    const params = client.callbackParams(req);
    
    // 驗證 state 和 nonce
    if (params.state !== req.session.state) {
      throw new Error('State mismatch');
    }
    
    const tokenSet = await client.callback(
      'https://papperhelper.xyz',
      params,
      {
        nonce: req.session.nonce,
        state: req.session.state,
      }
    );
    
    const userInfo = await client.userinfo(tokenSet.access_token);
    
    // 儲存或更新使用者資訊到 MongoDB
    try {
      // 檢查使用者是否已存在
      let user = await User.findOne({ email: userInfo.email });
      
      if (!user) {
        // 如果使用者不存在，創建新使用者
        user = new User({
          email: userInfo.email,
          name: userInfo.username || userInfo.email.split('@')[0], // 如果沒有名字，使用 email 的使用者名稱部分
          cognitoId: userInfo.sub // Cognito 的唯一識別碼
          // password 欄位保持空白，因為使用 Cognito 認證
        });
        await user.save();
        console.log('New user created:', user.email);
      } else {
        // 如果使用者已存在，更新資訊
        user.name = userInfo.name || user.name;
        user.cognitoId = userInfo.sub;
        await user.save();
        console.log('User information updated:', user.email);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // 即使資料庫操作失敗，我們仍然允許使用者登入
    }
    
    // 儲存用戶信息和令牌到 session
    req.session.userInfo = userInfo;
    req.session.tokenSet = tokenSet;
    
    // 清除 state 和 nonce
    delete req.session.state;
    delete req.session.nonce;
    
    res.redirect('/');
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect('/?error=callback_failed');
  }
});

// 登入成功頁面
// app.get('/success', checkAuth, (req, res) => {
//   if (!req.isAuthenticated) {
//     return res.redirect('/');
//   }
//   res.render('success', {
//     userInfo: req.session.userInfo,
//   });
// });

  // 登出路由
app.get('/logout', (req, res) => {
  // 使用你的實際 Cognito 域名
  const domain = 'https://ap-northeast-1odm2lkbpx.auth.ap-northeast-1.amazoncognito.com';
  const logoutUrl = new URL(`${domain}/logout`);
  
  logoutUrl.searchParams.append('client_id', '17h5f4upjp9nf0u0at0bjpltun');
  logoutUrl.searchParams.append('logout_uri', 'https://g11.papperhelper.xyz/logout-success');
  logoutUrl.searchParams.append('redirect_uri', 'https://g11.papperhelper.xyz/logout-success');
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    console.log('Redirecting to:', logoutUrl.toString()); // 添加日誌來檢查 URL
    res.redirect(logoutUrl.toString());
  });
});

// 登出成功路由
app.get('/logout-success', (req, res) => {
  res.render('logout-success', {
    message: 'You have been successfully logged out'
  });
});

// 錯誤處理
app.use(errorHandler);

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
