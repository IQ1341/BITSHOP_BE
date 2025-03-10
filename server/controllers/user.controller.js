import UserModel from "../models/user.model.js";
import sendEmail from "../config/sendEmail.js";
import bcryptjs from "bcryptjs"
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";

 export async function registerUserController(request,response) {
    try {
        const {name,email,password} = request.body
        if (!name || !email || !password){
            return response.status(400).json({
                message : "Provide name,email,password",
                error : true,
                success : false
            })
        }
        const user = await UserModel.findOne({email})
        if(user){
            return response.json({
                message : "Alredy register email",
                error : true,
                success : false
            })
        }
        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password,salt)

        const payload ={
            name,
            email,
            password : hashPassword
        }

        const newUser = new UserModel(payload)
        const save = await newUser.save()

        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`
        const verifyEmail = await sendEmail({
            sendTo : email,
            subject : "Verifikasi Email dari BITSHOP",
            html : verifyEmailTemplate({
                name,
                url : VerifyEmailUrl
            })
        })
        return response.json({
            message : "Anda Berhasil registrasi",
            error : false,
            success : true,
            data : save
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
 }

 export async function verifyEmailController(request,response) {
    try {
        const { code } = request.body
        const user = await UserModel.findOne({_id : code })
        if (user){
            return response.status(400).json({
                message : "invalide code",
                error : true,
                success : false
            })
        }

        const updateUser = await UserModel.updateOne({_id : code },{
            verify_email : true
        })
        return response.json({
            message : "Verikasi Email selesai",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
 }

 export async function loginController(request,response) {
    try {
        const {email , password} = request.body
        if(!email || !password){
            return response.status(400).json({
                message : "Masukkan Email,Password",
                error : true,
                success : false
            })
        }
        const user = await UserModel.findOne({email})

        if (!user) {
            return response.status(400).jason({
                message : "User belum login",
                error : true,
                success : false
            })
        }

        if (user.status !== "Active") {
            return response.status(400).jason({
                message : "Contact to admin",
                error : true,
                success : false
            })
        }

        const checkPassword = await bcryptjs.compare(password,user.password)
        if (!checkPassword) {
            return response.status(400).json({
                message : "Check Password Anda",
                error : true,
                success : false
            })
        }

        const accessToken = await generatedAccessToken(user._id)
        const refreshToken = await generatedRefreshToken(user._id)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        response.cookie('accessToken',accessToken,cookiesOption)
        response.cookie('refreshToken',refreshToken,cookiesOption)
        return response.json({
            message : "Login berhasil",
            error : false,
            success : true,
            data : {
                accessToken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
 }

 export async function logOutController(request,response) {
    try {
        const userId = request.userId
        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userId,{
            refresh_token : ""
        })
        return response.json({
            message : "Berhasil LogOut",
            erro : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
 }

 export async function uploadAvatar(request,response) {
    try {
        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
 }