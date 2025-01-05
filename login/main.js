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
  cognitoId: String
});

const User = mongoose.model('User', userSchema);

// 設定工作階段中介軟體
app.use(
  session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
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
      post_logout_redirect_uris: ['https://g11.papperhelper.xyz'],
      response_types: ['code'],
    });
    console.log('OpenID Client Initialized Successfully');
  } catch (error) {
    console.error('Error initializing OpenID Client:', error);
    process.exit(1);
  }
}

// 初始化客戶端
initializeClient();

// Helper function to extract path from URL
function getPathFromURL(urlString) {
  try {
    const url = new URL(urlString);
    return url.pathname;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

// 主路由
// app.get('/', (req, res) => {
//   res.render('home', {
//     isAuthenticated: !!req.session.userInfo,
//     userInfo: req.session.userInfo,
//   });
// });
// app.get('/', (req, res) => {
//   if (!req.session.userInfo) {
//     // 如果未登入，重定向到靜態網站首頁
//     return res.redirect('https://g11.paperhelper.xyz');
//   }

//   // 如果已登入，重定向到應用程式頁面
//   return res.redirect('https://papperhelper.xyz');
// });

app.get('/', (req, res) => {
  if (req.session.userInfo) {
    // 如果未登入，重定向到靜態網站首頁
    return res.redirect('https://papperhelper.xyz');;
  }
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

// 通用回調路由
app.get(getPathFromURL('https://papperhelper.xyz'), async (req, res) => {
  try {
    const params = client.callbackParams(req);

    if (params.state !== req.session.state) {
      throw new Error('State mismatch');
    }

    const tokenSet = await client.callback(
      'https://papperhelper.xyz',
      params,
      {
        nonce: req.session.nonce,
        state: req.session.state
      }
    );

    const userInfo = await client.userinfo(tokenSet.access_token);

    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      user = new User({
        email: userInfo.email,
        name: userInfo.username || userInfo.email.split('@')[0],
        cognitoId: userInfo.sub
      });
      await user.save();
      console.log('New user created:', user.email);
    }

    req.session.userInfo = userInfo;
    req.session.tokenSet = tokenSet;

    delete req.session.state;
    delete req.session.nonce;

    res.redirect('/');
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect('/?error=callback_failed');
  }
});

// 登出路由
app.get('/logout', (req, res) => {
  const domain = 'https://ap-northeast-1odm2lkbpx.auth.ap-northeast-1.amazoncognito.com';
  const logoutUrl = new URL(`${domain}/logout`);
  
  logoutUrl.searchParams.append('client_id', '17h5f4upjp9nf0u0at0bjpltun');
  logoutUrl.searchParams.append('logout_uri', 'https://g11.papperhelper.xyz');
  
  req.session.destroy(err => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect(logoutUrl.toString());
  });
});

// // 登出成功路由
// app.get('/logout-success', (req, res) => {
//   res.render('logout-success', { message: 'You have been successfully logged out' });
// });

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
