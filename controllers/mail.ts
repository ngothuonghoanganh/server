import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { google } from "googleapis"

class MailController {
    OAuth2 = google.auth.OAuth2;

    public sendMail = async (to: string, body: string, subject: string) => {
        try {
            const oauth2Client = new this.OAuth2(
                "318895805067-07na576g3eni7e7hkljt00aegsg40n80.apps.googleusercontent.com",
                "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",
                "https://developers.google.com/oauthplayground"
            );

            oauth2Client.setCredentials({
                refresh_token: "1//04BEBLuSuzjjtCgYIARAAGAQSNwF-L9IrciWm-aNIiAXbAIQKyky-POat3_3Pb8QpHkUJc9HasBB9wJjC4wpoEC9PdFTIiN6fIEI"
            });

            const accessToken = await oauth2Client.getAccessToken()
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
                to: to,
                subject: subject,
                text: "hello",
                html: body
            });
            return info
        } catch (error) {
            console.log(error)
        }
    }

    mailCampaignTemplate = ({
        productName,
        campaignName,
        customerName,
        campaignCode,
        productPrice,
        productDiscountPrice,
        productImage
    }: any) => {
        return `
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%">
        <tbody>
            <tr>
                <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                    <div
                        style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top"
                            width="100%">
                            <tbody>
                                <tr>
                                    <td align="center" style="font-size:0px;padding:10px;word-break:break-word">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                            style="border-collapse:collapse;border-spacing:0px">
                                            <tbody>
                                                <tr>
                                                    <td style="width:150px"> <img height="auto"
                                                            src="https://firebasestorage.googleapis.com/v0/b/wsg-authen-144ba.appspot.com/o/279668010_507367344357576_5851876656621045223_n.png?alt=media&token=1f6d7209-613b-4907-b5e7-df700e440191"
                                                            style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px"
                                                            width="150" class="CToWUd"> </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-size:0px;padding:10px;word-break:break-word">
                                        <div
                                            style="font-family:Helvetica,Arial,sans-serif;font-size:20px;line-height:32px;text-align:center;color:#404040">
                                            Hệ thống đã tạo một chiến dịch mới ${campaignName}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left" style="font-size:0px;padding:10px;word-break:break-word">
                                        <div
                                            style="font-family:Ubuntu,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;text-align:left;color:#000000">
                                            <p>Xin chào ${customerName}<br> Thông Tin Chiến dịch mới dưới dây</p>
                                            <p style="border-bottom:2px double black"></p>
                                            <p></p>
                                            <table width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td><span style="font-weight:bold">Mã chiến dịch</span></td>
                                                        <td>: ${campaignCode}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span style="font-weight:bold">Ngày tạo</span>
                                                        </td>
                                                        <td>: 31/03/2021 09:30:27</td>
                                                    </tr>
                                                    <tr>

                                                        <table border="0" cellpadding="2" cellspacing="2" width="100%"
                                                            style="border-collapse:collapse">
                                                            <tbody>
                                                                <tr>
                                                                    <td width="15%">
                                                                        <table>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td valign="top">
                                                                                        <img src=${productImage}
                                                                                            width="60" height="60"
                                                                                            style="border-radius:25%"
                                                                                            class="CToWUd"
                                                                                            jslog="138226; u014N:xr6bB; 53:W2ZhbHNlXQ..">
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                    <td width="85%">
                                                                        <table border="0" cellpadding="1"
                                                                            cellspacing="1" width="100%"
                                                                            id="m_6635676532494199412subtable1">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                        <table
                                                                                            id="m_6635676532494199412subtable1line1">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td width="100%"
                                                                                                        style="text-overflow:ellipsis">
                                                                                                        <font size="3">
                                                                                                            <b>${productName}</b>
                                                                                                            <font>
                                                                                                            </font>
                                                                                                        </font>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <table
                                                                                            id="m_6635676532494199412subtable1line2"
                                                                                            width="100%">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td width="90%"
                                                                                                        align="left">
                                                                                                        <font size="2"
                                                                                                            color="#737373">
                                                                                                            ${productName}
                                                                                                        </font>
                                                                                                    </td>
                                                                                                    <td width="10%"
                                                                                                        align="right">x1
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <table
                                                                                            id="m_6635676532494199412subtable1line3"
                                                                                            width="100%">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td width="30%">
                                                                                                    </td>
                                                                                                    <td width="35%"
                                                                                                        align="right">
                                                                                                        <font
                                                                                                            color="#737373">
                                                                                                            <strike>đ
                                                                                                                ${productPrice}</strike>
                                                                                                        </font>
                                                                                                    </td>
                                                                                                    <td width="35%"
                                                                                                        align="right">
                                                                                                        <b>đ
                                                                                                            ${productDiscountPrice}</b>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>

                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    style="border-top:1pt dashed #00000030;border-bottom:1pt solid #00000030">
                                                                    <td width="30%" valign="top"></td>
                                                                    <td width="35%"
                                                                        style="text-align:left;padding:10px"></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </tr>
                                                    <tr>
                                                    </tr>
                                                    <tr>
                                                        <td align="left"
                                                            style="font-size:0px;padding:10px;word-break:break-word">
                                                            <div
                                                                style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;text-align:left;color:#000000">
                                                                Trân trọng,</div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left"
                                                            style="font-size:0px;padding:10px;word-break:break-word">
                                                            <div
                                                                style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;text-align:left;color:#000000">
                                                                Hệ thống SWG.</div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    `
    }
}

export default new MailController()