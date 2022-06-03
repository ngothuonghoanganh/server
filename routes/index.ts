import * as express from "express";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";
// khởi tạo validator
const validator = createValidator();
//lấy schema từ validation trong services
import Payment from "../controllers/payment";
import transaction from "../controllers/transaction";
import { Transaction } from "../models/transaction";
import moment from "moment";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { google } from "googleapis"
const OAuth2 = google.auth.OAuth2;

const router = express.Router();

router.get(
  "/",
  authentication.protected,
  async (req: any, res: any, next) => {
    try {
      const oauth2Client = new OAuth2(
        "318895805067-07na576g3eni7e7hkljt00aegsg40n80.apps.googleusercontent.com",
        "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",
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({
        refresh_token: "1//04BEBLuSuzjjtCgYIARAAGAQSNwF-L9IrciWm-aNIiAXbAIQKyky-POat3_3Pb8QpHkUJc9HasBB9wJjC4wpoEC9PdFTIiN6fIEI"
      });

      const accessToken = await oauth2Client.getAccessToken()
      console.log(accessToken)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'ngothuonghoanganh1144@gmail.com',
          clientId: "318895805067-07na576g3eni7e7hkljt00aegsg40n80.apps.googleusercontent.com",
          clientSecret: "GOCSPX-qI_t18J4ws9QgHiYkBN4N2lfaFH",
          // pass: '0354973771', 
          accessToken: `${accessToken.token}`,
          // accessToken: "ya29.a0ARrdaM9UxirXspn23gVszG14Jmtjygl53bTzBMxSZl9VnjXXljIaemWw8wyiNb2X9VDY2c-bQWjVsHyzcB2PE9ueCyB-eX_rq25Nec9GTzlPYRCK7lzmAU3HVyAckWjF3R8FhILws4W9njrQQUcUbOB77hWk",
          refreshToken: "1//04BEBLuSuzjjtCgYIARAAGAQSNwF-L9IrciWm-aNIiAXbAIQKyky-POat3_3Pb8QpHkUJc9HasBB9wJjC4wpoEC9PdFTIiN6fIEI"
        }
      });
      // 1//04BEBLuSuzjjtCgYIARAAGAQSNwF-L9IrciWm-aNIiAXbAIQKyky-POat3_3Pb8QpHkUJc9HasBB9wJjC4wpoEC9PdFTIiN6fIEI
      // ya29.a0ARrdaM9UxirXspn23gVszG14Jmtjygl53bTzBMxSZl9VnjXXljIaemWw8wyiNb2X9VDY2c-bQWjVsHyzcB2PE9ueCyB-eX_rq25Nec9GTzlPYRCK7lzmAU3HVyAckWjF3R8FhILws4W9njrQQUcUbOB77hWk

      const info = await transporter.sendMail({
        from: 'no-reply@gmail.com',
        to: ["anhnthse130011@fpt.edu.vn", "ngothuonghoanganh1144@gmail.com"],
        subject: "Hello from node",
        html: `
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
              <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
                  <tbody><tr>
                    <td align="center" style="font-size:0px;padding:10px;word-break:break-word">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                        <tbody>
                          <tr>
                            <td style="width:150px"> <img height="auto" src="https://ci6.googleusercontent.com/proxy/pVf-E-chPO8katG6peDT4YLXLZCwI4W1gEFXUP0QYyrxGtgRqBU9K-7yceFxKjLC8UqfyEcEx_0PzHEDfHSehkl9raBzelLzMM-N4g=s0-d-e1-ft#https://mapp.vn/wp-content/uploads/2019/07/Untitled-1.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="150" class="CToWUd"> </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-size:0px;padding:10px;word-break:break-word">
                      <div style="font-family:Helvetica,Arial,sans-serif;font-size:20px;line-height:32px;text-align:center;color:#404040">Hệ thống đã ghi nhận một đơn hàng mới DP2103314278</div>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="font-size:0px;padding:10px;word-break:break-word">
                      <div style="font-family:Ubuntu,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;text-align:left;color:#000000"><p>Xin chào Yddf<br> Hệ thống đã ghi nhận một đơn hàng mới với thông tin dưới đây</p><p style="border-bottom:2px double black"></p><p></p><table width="auto"><tbody><tr><td><span style="font-weight:bold">Mã đơn hàng</span></td><td>: #DP2103314278</td></tr><tr><td><span style="font-weight:bold">Ngày đặt</span></td><td>: 31/03/2021 09:30:27</td></tr></tbody></table><p></p><p style="border-bottom:2px dashed black"></p><p></p><table width="auto"><tbody><tr><td style="white-space:nowrap">Người dùng</td><td>: Yddf</td></tr><tr><td style="white-space:nowrap">Địa chỉ</td><td>: <a href="http://hddfy.com" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://hddfy.com&amp;source=gmail&amp;ust=1654302557261000&amp;usg=AOvVaw3IwU0ToZu4RBaPZjjKiTX7">hddfy.com</a> Thị trấn Cờ Đỏ Huyện Cờ Đỏ Thành phố Cần Thơ</td></tr><tr><td style="white-space:nowrap">Số điện thoại</td><td>: 0327123123</td></tr><tr><td style="white-space:nowrap">Email</td><td>: <a href="mailto:ngothuonghoanganh1144@gmail.com" target="_blank">ngothuonghoanganh1144@gmail.<wbr>com</a></td></tr></tbody></table><p></p><p style="border-bottom:2px dashed black"></p><p></p><table border="0" cellpadding="2" cellspacing="2" width="100%" style="border-collapse:collapse"><tbody><tr><td width="15%"><table><tbody><tr><td valign="top"><img src="https://ci5.googleusercontent.com/proxy/YFmccZiqnbqQdS-mJmsAkkKMu_bCs2xeD0nbFUynXwzVPFKP-TWov1miwxnPMiL4jw=s0-d-e1-ft#http://localhost:3006undefined" width="60" height="60" style="border-radius:25%" class="CToWUd" jslog="138226; u014N:xr6bB; 53:W2ZhbHNlXQ.."></td></tr></tbody></table></td><td width="85%"><table border="0" cellpadding="1" cellspacing="1" width="100%" id="m_6635676532494199412subtable1"><tbody><tr><td><table id="m_6635676532494199412subtable1line1"><tbody><tr><td width="100%" style="text-overflow:ellipsis"><font size="3"><b>Mỹ phẩm 993</b><font></font></font></td></tr></tbody></table></td></tr><tr><td><table id="m_6635676532494199412subtable1line2" width="100%"><tbody><tr><td width="90%" align="left"><font size="2" color="#737373">Mỹ phẩm 993</font></td><td width="10%" align="right">x1</td></tr></tbody></table></td></tr><tr><td><table id="m_6635676532494199412subtable1line3" width="100%"><tbody><tr><td width="30%"></td><td width="35%" align="right"><font color="#737373"><strike>đ 700,000</strike></font></td><td width="35%" align="right"><b>đ 670,000</b></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr style="border-top:1pt dashed #00000030;border-bottom:1pt solid #00000030"><td width="30%" valign="top">Ghi chú:</td><td width="35%" style="text-align:left;padding:10px"></td></tr><tr><td width="15%"><table><tbody><tr><td valign="top"><img src="https://ci5.googleusercontent.com/proxy/YFmccZiqnbqQdS-mJmsAkkKMu_bCs2xeD0nbFUynXwzVPFKP-TWov1miwxnPMiL4jw=s0-d-e1-ft#http://localhost:3006undefined" width="60" height="60" style="border-radius:25%" class="CToWUd" jslog="138226; u014N:xr6bB; 53:W2ZhbHNlXQ.."></td></tr></tbody></table></td><td width="85%"><table border="0" cellpadding="1" cellspacing="1" width="100%" id="m_6635676532494199412subtable1"><tbody><tr><td><table id="m_6635676532494199412subtable1line1"><tbody><tr><td width="100%" style="text-overflow:ellipsis"><font size="3"><b>Mỹ phẩm 993</b><font></font></font></td></tr></tbody></table></td></tr><tr><td><table id="m_6635676532494199412subtable1line2" width="100%"><tbody><tr><td width="90%" align="left"><font size="2" color="#737373">Mỹ phẩm 993</font></td><td width="10%" align="right">x1</td></tr></tbody></table></td></tr><tr><td><table id="m_6635676532494199412subtable1line3" width="100%"><tbody><tr><td width="30%"></td><td width="35%" align="right"><font color="#737373"><strike>đ 700,000</strike></font></td><td width="35%" align="right"><b>đ 670,000</b></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr style="border-top:1pt dashed #00000030;border-bottom:1pt solid #00000030"><td width="30%" valign="top">Ghi chú:</td><td width="35%" style="text-align:left;padding:10px"></td></tr><tr><td width="15%"><table><tbody><tr><td valign="top"><img src="https://ci5.googleusercontent.com/proxy/YFmccZiqnbqQdS-mJmsAkkKMu_bCs2xeD0nbFUynXwzVPFKP-TWov1miwxnPMiL4jw=s0-d-e1-ft#http://localhost:3006undefined" width="60" height="60" style="border-radius:25%" class="CToWUd" jslog="138226; u014N:xr6bB; 53:W2ZhbHNlXQ.."></td></tr></tbody></table></td><td width="85%"><table border="0" cellpadding="1" cellspacing="1" width="100%" id="m_6635676532494199412subtable1"><tbody><tr><td><table id="m_6635676532494199412subtable1line1"><tbody><tr><td width="100%" style="text-overflow:ellipsis"><font size="3"><b>Mỹ phẩm 993</b><font></font></font></td></tr></tbody></table></td></tr><tr><td><table id="m_6635676532494199412subtable1line2" width="100%"><tbody><tr><td width="90%" align="left"><font size="2" color="#737373">Mỹ phẩm 993</font></td><td width="10%" align="right">x1</td></tr></tbody></table></td></tr><tr><td><table id="m_6635676532494199412subtable1line3" width="100%"><tbody><tr><td width="30%"></td><td width="35%" align="right"><font color="#737373"><strike>đ 700,000</strike></font></td><td width="35%" align="right"><b>đ 670,000</b></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr style="border-top:1pt dashed #00000030;border-bottom:1pt solid #00000030"><td width="30%" valign="top">Ghi chú:</td><td width="35%" style="text-align:left;padding:10px"></td></tr></tbody></table><p></p><p style="border-bottom:2px dashed black"></p><p></p><table border="0" cellpadding="2" cellspacing="2" width="100%"><tbody><tr><td>Tổng tiền</td><td align="right">đ 2,010,000</td></tr><tr><td>Phí vận chuyển</td><td align="right">đ 0</td></tr><tr><td>Giảm giá phí vận chuyển</td><td align="right">đ 0</td></tr><tr><td>Mã khuyến mãi</td><td align="right">đ 0 </td></tr><tr><td>Tổng thanh toán</td><td align="right">đ 2,010,000</td></tr></tbody></table><p></p><p style="border-bottom:2px double black"></p><p>Cảm ơn Yddf đã đặt hàng tại Spa An</p></div>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="font-size:0px;padding:10px;word-break:break-word">
                      <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;text-align:left;color:#000000">Để biết thêm thông tin, hãy truy cập <a href="https://mapp.vn/" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://mapp.vn/&amp;source=gmail&amp;ust=1654302557261000&amp;usg=AOvVaw2SuQiMXmstH-P9SoCFcNhI">mapp.vn</a>.</div>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="font-size:0px;padding:10px;word-break:break-word">
                      <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;text-align:left;color:#000000">Trân trọng,</div>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="font-size:0px;padding:10px;word-break:break-word">
                      <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;text-align:left;color:#000000">Hệ thống CRM.</div>
                    </td>
                  </tr>
                </tbody></table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>`,
      });

      return res.send(info)
      // return res.redirect(paymentlink)
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  }
);

router.post("/", Payment.createPayment);

router.get("/statistical/supplier", authentication.protected, async (req: any, res: any, next) => {
  try {

    const supplierId = req.user.id
    const startDateInMonth = moment().startOf("M")
    const endDateInMonth = moment().endOf("M")

    const [orders, income, totalIncomeInThisMonth, totalOrderInThisMonth] = await Promise.all([Transaction.query().select(Transaction.raw(` 
    to_char(date_trunc('month', "createdAt"), 'YYYY') AS year,
    to_char(date_trunc('month', "createdAt"), 'Mon') AS month,
    to_char(date_trunc('month', "createdAt"), 'MM') AS "monthNumber",
    count(*) as totalOrders`))
      .where("type", "orderTransaction")
      .andWhere("supplierId", supplierId)
      .groupBy("year", "month", "monthNumber"),
    Transaction.query().select(Transaction.raw(` 
      to_char(date_trunc('month', "createdAt"), 'YYYY') AS year,
      to_char(date_trunc('month', "createdAt"), 'Mon') AS month,
      to_char(date_trunc('month', "createdAt"), 'MM') AS "monthNumber",
      sum(amount) as totalIncome`))
      .where("type", "orderTransaction")
      .andWhere("supplierId", supplierId)
      .groupBy("year", "month", "monthNumber"),
    Transaction.query()
      .select().sum("amount")
      // .whereBetween("createdAt", [startDateInMonth, endDateInMonth])
      .where("supplierId", supplierId)
      .andWhere("type", "orderTransaction")
      .first(),
    Transaction.query()
      .select().count("*")
      // .whereBetween("createdAt", [startDateInMonth, endDateInMonth])
      .where("supplierId", supplierId)
      .andWhere("type", "orderTransaction")
      .first()
    ])

    return res.status(200).send({
      orders,
      income,
      totalIncomeInThisMonth,
      totalOrderInThisMonth
    })
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error });
  }
})

export default router;
