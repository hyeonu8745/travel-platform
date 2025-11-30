const { Trip, User, TripDay, DayStop } = require('../models');
const { Op } = require('sequelize');
const ValidationError = require('../errors/validation.error');
const NotFoundError = require('../errors/notFound.error');
const ForbiddenError = require('../errors/forbidden.error');

class TripController {

    // 1. 여행 코스 목록 조회 (검색 기능 포함)
    async getAllTrips(req, res) {
        try {
            const searchQuery = req.query.search_query;
            const whereCondition = {};

            if (searchQuery) {
                whereCondition.title = { [Op.like]: `%${searchQuery}%` };
            }

            const trips = await Trip.findAll({
                where: whereCondition,
                include: [
                    {
                        model: User,
                        as: 'Author',
                        attributes: ['user_id', 'nickname']
                    },
                    {
                        model: TripDay,
                        as: 'Days',
                        include: [{
                            model: DayStop,
                            as: 'Stops'
                        }]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({
                success: true,
                message: '여행 코스 목록 조회 성공',
                data: trips
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: '서버 에러' });
        }
    }

    // 2. 여행 코스 상세 조회
    async getTripDetails(req, res) {
        // ⭐️ [수정] req.params.id -> req.params.tripId
        const tripId = req.params.tripId; 
        
        if (!tripId) {
            throw new ValidationError('유효하지 않은 Trip ID입니다.');
        }

        const trip = await Trip.findOne({
            where: { trip_id: tripId },
            include: [
                {
                    model: User,
                    as: 'Author',
                    attributes: ['user_id', 'nickname']
                },
                {
                    model: TripDay,
                    as: 'Days',
                    include: [{
                        model: DayStop,
                        as: 'Stops'
                    }]
                }
            ],
            order: [
                [{ model: TripDay, as: 'Days' }, 'day_index', 'ASC'],
                [{ model: TripDay, as: 'Days' }, { model: DayStop, as: 'Stops' }, 'stop_order', 'ASC']
            ]
        });

        if (!trip) {
            throw new NotFoundError('여행 코스');
        }

        await trip.increment('view_count', { by: 1 });

        res.status(200).json({
            success: true,
            data: trip
        });
    }

    // 3. 여행 코스 생성 (이미지 포함)
    async createTrip(req, res) {
        const userId = req.user.user_id;
        
        // ⭐️ [추가] 이미지 파일 처리 (upload.single('image') 미들웨어를 거쳤다면 req.file이 있음)
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // ⭐️ [수정] Multipart로 오면 데이터가 문자열로 오므로 JSON.parse 필요
        const { title, startDate, endDate } = req.body;
        let stops = [];

        try {
            // stops가 문자열로 오면 파싱, 객체면 그대로 사용
            if (typeof req.body.stops === 'string') {
                stops = JSON.parse(req.body.stops);
            } else {
                stops = req.body.stops || [];
            }
        } catch (e) {
            throw new ValidationError('stops 데이터 형식이 잘못되었습니다.');
        }

        if (!title || !startDate || !endDate || !stops || stops.length === 0) {
            throw new ValidationError('필수 정보가 누락되었습니다.');
        }

        // ⭐️ [수정] image_url 저장
        const newTrip = await Trip.create({
            user_id: userId,
            title,
            start_date: startDate,
            end_date: endDate,
            image_url: imageUrl // DB에 이미지 경로 저장
        });

        const daysMap = {};
        
        // ... (이하 Day/Stop 저장 로직은 기존과 동일) ...
        
        for (const stop of stops) {
            if (!daysMap[stop.day]) {
                const newDay = await TripDay.create({
                    trip_id: newTrip.trip_id,
                    day_index: stop.day,
                    date: new Date(startDate)
                });
                daysMap[stop.day] = newDay.day_id;
            }
        }

        for (const stop of stops) {
            await DayStop.create({
                day_id: daysMap[stop.day],
                stop_order: stop.order || 1,
                location_name: stop.name,
                latitude: stop.lat,
                longitude: stop.lng,
                memo: stop.memo
            });
        }

        res.status(201).json({
            success: true,
            message: '여행 코스 생성 성공',
            data: newTrip
        });
    }

    // 4. 여행 코스 삭제
    async deleteTrip(req, res) {
        // ⭐️ [수정] req.params.id -> req.params.tripId
        const tripId = req.params.tripId;
        const userId = req.user.user_id;
        const userRole = req.user.role;

        if (!tripId) {
            throw new ValidationError('유효하지 않은 Trip ID입니다.');
        }

        const trip = await Trip.findByPk(tripId);
        if (!trip) {
            throw new NotFoundError('여행 코스');
        }

        if (trip.user_id !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenError('삭제 권한이 없습니다.');
        }

        await trip.destroy();

        res.status(200).json({
            success: true,
            message: '여행 코스 삭제 성공'
        });
    }

    // ⭐️ [추가] 내 여행만 보기 (getMyTrips) - 라우터에 있으니 기능 추가
    async getMyTrips(req, res) {
        const userId = req.user.user_id;
        
        const trips = await Trip.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: User,
                    as: 'Author',
                    attributes: ['user_id', 'nickname']
                },
                {
                    model: TripDay,
                    as: 'Days',
                    include: [{ model: DayStop, as: 'Stops' }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        res.status(200).json({
            success: true,
            data: trips
        });
    }
}

module.exports = new TripController();
