/* Seed data — schema v3.
   Structure: data.notebooks[] → notebook.modules[] → module.features[]
*/

export const uid = (p = "x") =>
  p + "_" + Math.random().toString(36).slice(2, 7);

/* ── Individual modules ── */
export const SALES = {
  id: "mod_sale",
  name: "Sales",
  tech: "sale",
  color: "#5BAA50",
  status: "studying",
  updatedAt: "2026-05-13",
  overview: {
    version: "18.0",
    category: "Bán hàng",
    depends: "base, mail, account, stock, product, portal",
    menu: "Sales ▸ Orders ▸ Quotations",
    purpose:
      "Quản lý toàn bộ quy trình bán hàng từ báo giá → đơn hàng → giao hàng → hóa đơn. Tích hợp với Inventory để xuất kho và Accounting để ghi nhận doanh thu. Hỗ trợ giá theo bảng giá, chiết khấu, thuế đa cấp, và quy trình duyệt nhiều cấp."
  },
  mainFlows: [],
  features: [
    {
      id: "f_sale_1",
      name: "Tạo & Xác nhận báo giá",
      desc: "Tạo bản nháp, gửi khách, xác nhận đơn hàng",
      models: {
        cards: [
          {
            id: "mc_so", name: "sale.order", color: "#5BAA50", x: 40, y: 40, width: 310,
            fields: [
              { name: "name",         type: "Char",      desc: "Mã đơn (SO00…)", req: true },
              { name: "partner_id",   type: "Many2one",  desc: "Khách hàng",     req: true, relTo: "mc_partner" },
              { name: "pricelist_id", type: "Many2one",  desc: "Bảng giá" },
              { name: "state",        type: "Selection", desc: "draft/sent/sale" },
              { name: "date_order",   type: "Datetime",  desc: "Ngày báo giá",   req: true },
              { name: "order_line",   type: "One2many",  desc: "Chi tiết đơn",   relTo: "mc_sol" },
              { name: "amount_total", type: "Monetary",  desc: "Tổng tiền" }
            ]
          },
          {
            id: "mc_sol", name: "sale.order.line", color: "#378ADD", x: 420, y: 40, width: 310,
            fields: [
              { name: "order_id",      type: "Many2one",  desc: "Đơn hàng",       req: true, relTo: "mc_so" },
              { name: "product_id",    type: "Many2one",  desc: "Sản phẩm",       req: true },
              { name: "product_uom_c", type: "Float",     desc: "Số lượng",       req: true },
              { name: "price_unit",    type: "Float",     desc: "Đơn giá" },
              { name: "discount",      type: "Float",     desc: "% chiết khấu" },
              { name: "tax_id",        type: "Many2many", desc: "Thuế áp dụng" },
              { name: "price_subtotal",type: "Monetary",  desc: "Thành tiền" }
            ]
          },
          {
            id: "mc_partner", name: "res.partner", color: "#D85A30", x: 40, y: 380, width: 310,
            fields: [
              { name: "name",          type: "Char",     desc: "Tên KH",   req: true },
              { name: "vat",           type: "Char",     desc: "MST" },
              { name: "property_paym", type: "Many2one", desc: "Điều khoản thanh toán" }
            ]
          }
        ]
      },
      flows: [],
      detailBlocks: [
        {
          id: "db_s1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Cho phép sales tạo nhanh báo giá cho khách hàng từ catalog sản phẩm, gửi qua email, và theo dõi trạng thái duyệt.</p><p>Áp dụng cho cả <b>B2B</b> (cần báo giá có ký) và <b>B2C</b> (giỏ hàng online qua portal).</p>"
        },
        {
          id: "db_s2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Tạo <code>sale.order</code> (draft) — auto fill địa chỉ giao/xuất hóa đơn từ <code>res.partner</code></li><li>Chọn sản phẩm, số lượng × giá × chiết khấu × thuế</li><li>Bấm <b>Send by Email</b> để gửi PDF báo giá (template <code>sale.email_template_edi_sale</code>)</li><li>Khi khách OK → bấm <b>Confirm</b> → state đổi sang <code>sale</code>, sinh <code>stock.picking</code> + <code>account.move</code></li></ol>"
        },
        {
          id: "db_s3", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Báo giá có thể có nhiều version (revision) — Odoo tự tăng số <mark style='background:#FEF08A'>(SO0001 → SO0001-1)</mark></li><li>Mỗi dòng order_line auto-tính <code>price_subtotal = qty × (unit − discount%) × (1 + tax%)</code></li><li>Pricelist quyết định <code>price_unit</code> mặc định khi chọn sản phẩm</li><li>Báo giá có <code>validity_date</code> — sau ngày này khách không click confirm được từ portal</li></ul>"
        }
      ],
      integrations: [
        { id:"int_s1", module:"product", icon:"ti-package", color:"#5BAA50", direction:"in",
          content:"<p>Lấy danh sách sản phẩm + giá vốn + đơn vị tính từ <code>product.product</code>.</p><p>Khi chọn sản phẩm vào order_line, các trường auto-fill:</p><ul><li><code>name</code> ← product.display_name</li><li><code>price_unit</code> ← product.list_price (hoặc pricelist nếu có)</li><li><code>tax_id</code> ← product.taxes_id</li><li><code>product_uom</code> ← product.uom_id</li></ul>" },
        { id:"int_s2", module:"res.partner", icon:"ti-user", color:"#7C3AED", direction:"in",
          content:"<p>Thông tin khách hàng: tên, MST, địa chỉ. Khi chọn partner_id:</p><ul><li>Auto chọn <code>pricelist_id</code> từ <code>partner.property_product_pricelist</code></li><li>Auto chọn <code>payment_term_id</code> từ <code>partner.property_payment_term_id</code></li><li>Auto fill địa chỉ giao hàng / xuất hóa đơn</li></ul>" },
        { id:"int_s3", module:"stock", icon:"ti-truck", color:"#D97706", direction:"out",
          content:"<p>Khi confirm SO, hệ thống tạo <code>stock.picking</code> (loại Outgoing) theo warehouse của SO.</p><p>Mỗi <code>order_line</code> có sản phẩm storable sẽ sinh 1 <code>stock.move</code>.</p>" },
        { id:"int_s4", module:"account", icon:"ti-calculator", color:"#2563EB", direction:"out",
          content:"<p>Khi invoice SO → tạo <code>account.move</code> (type: out_invoice).</p><p>Mapping: <code>sale.order.line</code> → <code>account.move.line</code> theo <code>invoice_policy</code> (ordered / delivered).</p>" },
        { id:"int_s5", module:"portal", icon:"ti-world", color:"#0891B2", direction:"bidi",
          content:"<p>Khách hàng có thể xem báo giá, xác nhận, và tải PDF qua portal link.</p><p>Portal user có thể sign online → cập nhật <code>signature</code> trên SO.</p>" }
      ],
      notes: "",
      cases: [
        {
          id: "cs_s1",
          title: "Báo giá không tự fill pricelist",
          status: "resolved",
          chatLink: "",
          description: "Khi tạo SO cho khách hàng đã có pricelist cố định trong cấu hình, hệ thống không tự điền pricelist_id mà để trống — sales phải chọn tay mỗi lần.",
          images: [],
          cause: "Partner chưa được set property_product_pricelist. Field này là company-dependent property, không phải trường thông thường.",
          resolution: "Vào menu Sales ▸ Configuration ▸ Settings, bật 'Pricelists'. Sau đó mở form partner → tab Sales & Purchase → set 'Pricelist' mặc định."
        }
      ]
    },
    { id: "f_sale_2", name: "Quản lý đơn hàng đã xác nhận", desc: "Theo dõi tiến độ giao hàng", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" },
    { id: "f_sale_3", name: "Giao hàng & Vận chuyển",       desc: "Tích hợp với Inventory để xuất kho", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" },
    { id: "f_sale_4", name: "Lập hóa đơn từ đơn hàng",     desc: "Sinh hóa đơn full / partial",        models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" }
  ]
};

export function emptyModule(opts) {
  return {
    id: opts.id,
    name: opts.name,
    tech: opts.tech,
    color: opts.color,
    status: opts.status || "pending",
    updatedAt: opts.updatedAt || "—",
    overview: {
      version: "18.0",
      category: opts.category || "—",
      depends: opts.depends || "base, mail",
      menu: opts.menu || "",
      purpose: opts.purpose || ""
    },
    mainFlows: [],
    features: opts.features || []
  };
}

export const PURCHASE = emptyModule({
  id: "mod_purchase", name: "Purchase", tech: "purchase",
  color: "#BA7517", status: "studying", updatedAt: "2026-09-08",
  category: "Mua hàng", depends: "base, mail, account, stock, product",
  menu: "Purchase ▸ Orders ▸ Requests for Quotation",
  purpose: "Quản lý toàn bộ quy trình mua hàng từ yêu cầu báo giá (RFQ) → xác nhận đơn mua (PO) → nhận hàng nhập kho → đối chiếu hóa đơn nhà cung cấp (3-way matching). Tích hợp với Inventory để tạo phiếu nhập kho và Accounting để ghi nhận công nợ phải trả, hỗ trợ so sánh giá nhiều nhà cung cấp qua product.supplierinfo.",
  features: [
    {
      id: "f_purchase_1",
      name: "Yêu cầu báo giá (RFQ)",
      desc: "Tạo RFQ, gửi nhiều NCC, so sánh giá, chọn NCC thắng",
      models: {
        cards: [
          {
            id: "mc_po", name: "purchase.order", color: "#BA7517", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",         type: "Char",      desc: "Mã đơn (P00…)",              req: true },
              { name: "partner_id",   type: "Many2one",  desc: "Nhà cung cấp",                req: true, relTo: "mc_vendor" },
              { name: "state",        type: "Selection", desc: "draft/sent/purchase/cancel" },
              { name: "date_order",   type: "Datetime",  desc: "Ngày tạo RFQ",                req: true },
              { name: "date_planned", type: "Datetime",  desc: "Ngày giao hàng dự kiến" },
              { name: "order_line",   type: "One2many",  desc: "Chi tiết đơn",                relTo: "mc_pol" },
              { name: "amount_total", type: "Monetary",  desc: "Tổng tiền" }
            ]
          },
          {
            id: "mc_pol", name: "purchase.order.line", color: "#378ADD", x: 420, y: 40, width: 320,
            fields: [
              { name: "order_id",       type: "Many2one",  desc: "Đơn mua",                      req: true, relTo: "mc_po" },
              { name: "product_id",     type: "Many2one",  desc: "Sản phẩm / Dịch vụ",           req: true },
              { name: "product_qty",    type: "Float",     desc: "Số lượng đặt",                 req: true },
              { name: "price_unit",     type: "Float",     desc: "Đơn giá (auto từ supplierinfo)" },
              { name: "date_planned",   type: "Date",       desc: "Ngày giao dự kiến (theo dòng)" },
              { name: "taxes_id",       type: "Many2many", desc: "Thuế áp dụng" },
              { name: "price_subtotal", type: "Monetary",  desc: "Thành tiền" }
            ]
          },
          {
            id: "mc_vendor", name: "res.partner", color: "#D85A30", x: 40, y: 400, width: 320,
            fields: [
              { name: "name",                          type: "Char",     desc: "Tên nhà cung cấp",                     req: true },
              { name: "vat",                            type: "Char",     desc: "MST" },
              { name: "supplier_rank",                  type: "Integer",  desc: "Điểm xếp hạng NCC (tự tăng khi có PO)" },
              { name: "property_supplier_payment_term_id", type: "Many2one", desc: "Điều khoản thanh toán cho NCC" }
            ]
          },
          {
            id: "mc_supplierinfo", name: "product.supplierinfo", color: "#F59E0B", x: 420, y: 400, width: 320,
            fields: [
              { name: "partner_id",      type: "Many2one", desc: "Nhà cung cấp",             req: true, relTo: "mc_vendor" },
              { name: "product_tmpl_id", type: "Many2one", desc: "Sản phẩm áp dụng",          req: true },
              { name: "price",           type: "Float",    desc: "Đơn giá NCC báo",           req: true },
              { name: "min_qty",         type: "Float",    desc: "Số lượng tối thiểu theo bậc giá" },
              { name: "delay",           type: "Integer",  desc: "Thời gian giao hàng (ngày)" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_purchase_1",
          name: "So sánh nhiều NCC trước khi chốt PO",
          nodes: [
            { id: "rn1", type: "start",     label: "Có nhu cầu mua (thủ công / Reordering Rule / MRP)", x: 40,   y: 140 },
            { id: "rn2", type: "task",      label: "Tạo RFQ (purchase.order, state=draft)",             x: 280,  y: 140 },
            { id: "rn3", type: "task",      label: "Gửi RFQ cho nhiều NCC qua email",                   x: 520,  y: 140 },
            { id: "rn4", type: "gateway",   label: "NCC phản hồi trước date_planned?",                  x: 760,  y: 140 },
            { id: "rn5", type: "task",      label: "So sánh giá & điều khoản giữa các báo giá",         x: 1000, y: 40  },
            { id: "rn6", type: "user_task", label: "Purchase Manager duyệt chọn NCC thắng",             x: 1240, y: 40  },
            { id: "rn7", type: "end",       label: "Confirm Order → state=purchase (thành PO)",         x: 1480, y: 40  },
            { id: "rn8", type: "end",       label: "Huỷ RFQ / gửi lại NCC khác",                         x: 1000, y: 260 }
          ],
          edges: [
            { id: "re1", from: "rn1", to: "rn2", label: "" },
            { id: "re2", from: "rn2", to: "rn3", label: "" },
            { id: "re3", from: "rn3", to: "rn4", label: "" },
            { id: "re4", from: "rn4", to: "rn5", label: "Có" },
            { id: "re5", from: "rn4", to: "rn8", label: "Không" },
            { id: "re6", from: "rn5", to: "rn6", label: "" },
            { id: "re7", from: "rn6", to: "rn7", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_purchase_1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Cho phép bộ phận mua hàng gửi yêu cầu báo giá (<b>Request for Quotation</b>) tới nhiều nhà cung cấp cùng lúc, so sánh giá/điều kiện giao hàng, rồi chốt một NCC để xác nhận thành đơn mua chính thức (PO).</p><p>Áp dụng cho cả mua nguyên vật liệu (liên kết Reordering Rule / MRP) và mua công cụ dụng cụ, dịch vụ ngoài kế hoạch.</p>"
        },
        {
          id: "db_purchase_2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Tạo <code>purchase.order</code> (draft) — chọn NCC, thêm sản phẩm/dịch vụ vào <code>order_line</code></li><li><code>price_unit</code> tự động lấy theo <code>product.supplierinfo</code> của NCC đã chọn (nếu có khai báo bậc giá theo <code>min_qty</code>)</li><li>Bấm <b>Send by Email</b> để gửi RFQ dạng PDF cho từng NCC — có thể tạo nhiều bản RFQ (mỗi NCC 1 bản) cho cùng nhu cầu để so sánh</li><li>Dùng view <b>Compare Product Lines</b> để đối chiếu giá/điều khoản giữa các RFQ đã gửi</li><li>Chọn RFQ thắng, bấm <b>Confirm Order</b> → state chuyển từ <code>sent</code> sang <code>purchase</code></li></ol>"
        },
        {
          id: "db_purchase_3", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Khi chưa xác nhận, RFQ có thể sửa tự do số lượng/giá; sau khi <code>state=purchase</code> việc sửa order_line sẽ tạo cảnh báo thay đổi cần NCC xác nhận lại</li><li><code>price_unit</code> ưu tiên lấy theo bậc giá <mark style='background:#FEF08A'>min_qty gần nhất ≤ product_qty</mark> trong product.supplierinfo, không tự nội suy giữa 2 bậc</li><li>Một sản phẩm có thể có nhiều <code>product.supplierinfo</code> — Odoo mặc định chọn dòng có <code>sequence</code> nhỏ nhất làm NCC ưu tiên</li><li>Không thể xác nhận PO nếu <code>order_line</code> rỗng hoặc <code>product_qty ≤ 0</code></li></ul>"
        }
      ],
      integrations: [
        { id: "int_purchase_1", module: "product", icon: "ti-package", color: "#5BAA50", direction: "in",
          content: "<p>Lấy giá và điều kiện mua từ <code>product.supplierinfo</code> gắn trên từng <code>product.template</code>.</p><ul><li><code>price_unit</code> ← supplierinfo.price theo bậc <code>min_qty</code></li><li><code>date_planned</code> (dòng) ← hôm nay + supplierinfo.delay (ngày giao)</li><li><code>product_uom</code> ← purchase UoM của sản phẩm</li></ul>" },
        { id: "int_purchase_2", module: "res.partner", icon: "ti-user", color: "#7C3AED", direction: "in",
          content: "<p>Thông tin NCC: tên, MST, điều khoản thanh toán.</p><ul><li>Auto chọn <code>payment_term_id</code> từ <code>partner.property_supplier_payment_term_id</code></li><li><code>supplier_rank</code> tự tăng mỗi khi partner được dùng làm NCC trên 1 PO đã xác nhận</li></ul>" },
        { id: "int_purchase_3", module: "mail", icon: "ti-mail", color: "#2563EB", direction: "out",
          content: "<p>Nút <b>Send by Email</b> gửi PDF RFQ (template <code>purchase.email_template_edi_purchase</code>) tới email của NCC, đồng thời log vào chatter của <code>purchase.order</code>.</p>" }
      ],
      notes: "Cân nhắc bật tính năng 'Purchase Agreements' (Blanket Order) cho các NCC ký hợp đồng khung theo quý, thay vì tạo RFQ rời từng lần.",
      cases: [
        {
          id: "cs_purchase_1",
          title: "Giá trên RFQ không khớp giá NCC đã báo qua bậc số lượng",
          status: "resolved",
          chatLink: "",
          description: "Khi thêm sản phẩm vào RFQ với số lượng lớn (vd 500), price_unit vẫn lấy giá của bậc số lượng nhỏ (vd 10) thay vì bậc giá tốt hơn đã khai báo cho min_qty=100 hoặc 500.",
          images: [],
          cause: "product.supplierinfo cho NCC này chỉ khai báo 1 dòng min_qty=10, chưa tạo thêm các dòng bậc giá min_qty=100/500 nên hệ thống không có gì để chọn giá tốt hơn — không phải lỗi tính toán mà là thiếu dữ liệu cấu hình.",
          resolution: "Bổ sung đầy đủ các dòng product.supplierinfo theo từng bậc min_qty mà NCC đã báo giá (10/100/500). Xoá dòng order_line cũ và thêm lại để price_unit tính lại theo bậc đúng."
        }
      ]
    },
    {
      id: "f_purchase_2",
      name: "Xác nhận PO & nhập kho",
      desc: "PO xác nhận → tạo phiếu nhập kho → đối chiếu hóa đơn NCC (3-way match)",
      models: {
        cards: [
          {
            id: "mc_po2", name: "purchase.order", color: "#BA7517", x: 40, y: 40, width: 300,
            fields: [
              { name: "name",            type: "Char",      desc: "Mã đơn mua",                 req: true },
              { name: "partner_id",      type: "Many2one",  desc: "Nhà cung cấp",                req: true },
              { name: "state",           type: "Selection", desc: "purchase / done (locked)" },
              { name: "date_approve",    type: "Datetime",  desc: "Ngày xác nhận PO" },
              { name: "invoice_status",  type: "Selection", desc: "no / to invoice / invoiced" },
              { name: "amount_total",    type: "Monetary",  desc: "Tổng tiền" }
            ]
          },
          {
            id: "mc_picking", name: "stock.picking", color: "#378ADD", x: 400, y: 40, width: 300,
            fields: [
              { name: "name",            type: "Char",      desc: "Mã phiếu nhập (WH/IN…)",       req: true },
              { name: "origin",          type: "Char",       desc: "Nguồn gốc (số PO)" },
              { name: "partner_id",      type: "Many2one",   desc: "Nhà cung cấp" },
              { name: "state",           type: "Selection",  desc: "draft/waiting/assigned/done" },
              { name: "scheduled_date",  type: "Datetime",   desc: "Ngày dự kiến nhận hàng" },
              { name: "move_ids",        type: "One2many",   desc: "Chi tiết dịch chuyển kho",     relTo: "mc_move" }
            ]
          },
          {
            id: "mc_move", name: "stock.move", color: "#0891B2", x: 760, y: 40, width: 300,
            fields: [
              { name: "product_id",       type: "Many2one",  desc: "Sản phẩm",                    req: true },
              { name: "product_uom_qty",  type: "Float",     desc: "SL cần nhận (theo PO)",        req: true },
              { name: "quantity",         type: "Float",     desc: "SL thực nhận (nhập tay/scan)" },
              { name: "picking_id",       type: "Many2one",  desc: "Phiếu nhập",                   relTo: "mc_picking" },
              { name: "state",            type: "Selection", desc: "draft/confirmed/assigned/done" }
            ]
          },
          {
            id: "mc_bill", name: "account.move", color: "#7F77DD", x: 400, y: 340, width: 320,
            fields: [
              { name: "name",             type: "Char",      desc: "Số hóa đơn NCC" },
              { name: "partner_id",       type: "Many2one",  desc: "Nhà cung cấp",                 req: true },
              { name: "invoice_origin",   type: "Char",       desc: "Đơn mua gốc" },
              { name: "invoice_line_ids", type: "One2many",   desc: "Chi tiết hóa đơn" },
              { name: "amount_total",     type: "Monetary",   desc: "Tổng tiền hóa đơn NCC" },
              { name: "payment_state",    type: "Selection",  desc: "not_paid/in_payment/paid" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_purchase_2",
          name: "Nhận hàng & đối chiếu hóa đơn NCC (3-way match)",
          nodes: [
            { id: "pn1",  type: "start",   label: "PO xác nhận (state=purchase)",                    x: 40,   y: 140 },
            { id: "pn2",  type: "task",    label: "Tự động tạo Receipt (stock.picking, Incoming)",   x: 280,  y: 140 },
            { id: "pn3",  type: "user_task", label: "Thủ kho kiểm đếm hàng thực nhận",               x: 520,  y: 140 },
            { id: "pn4",  type: "gateway", label: "Nhận đủ số lượng đặt?",                            x: 760,  y: 140 },
            { id: "pn5",  type: "task",    label: "Validate Receipt → cập nhật tồn kho đầy đủ",       x: 1000, y: 40  },
            { id: "pn6",  type: "task",    label: "Validate phần đã nhận → tạo Backorder cho phần thiếu", x: 1000, y: 260 },
            { id: "pn7",  type: "task",    label: "Kế toán tạo Vendor Bill từ PO",                    x: 1240, y: 140 },
            { id: "pn8",  type: "gateway", label: "3-way match: PO ≈ Receipt ≈ Bill?",                x: 1480, y: 140 },
            { id: "pn9",  type: "end",     label: "Post Bill → ghi nhận công nợ phải trả NCC",         x: 1720, y: 40  },
            { id: "pn10", type: "end",     label: "Giữ Bill ở draft, gửi NCC yêu cầu điều chỉnh",       x: 1720, y: 260 }
          ],
          edges: [
            { id: "pe1", from: "pn1", to: "pn2", label: "" },
            { id: "pe2", from: "pn2", to: "pn3", label: "" },
            { id: "pe3", from: "pn3", to: "pn4", label: "" },
            { id: "pe4", from: "pn4", to: "pn5", label: "Đủ" },
            { id: "pe5", from: "pn4", to: "pn6", label: "Thiếu" },
            { id: "pe6", from: "pn5", to: "pn7", label: "" },
            { id: "pe7", from: "pn6", to: "pn7", label: "" },
            { id: "pe8", from: "pn7", to: "pn8", label: "" },
            { id: "pe9", from: "pn8", to: "pn9", label: "Khớp" },
            { id: "pe10", from: "pn8", to: "pn10", label: "Lệch" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_purchase_4", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Sau khi PO được xác nhận, hệ thống theo dõi toàn bộ vòng đời nhận hàng thực tế và đối chiếu 3 chiều (<b>3-way matching</b>): <code>Đơn mua</code> — <code>Phiếu nhập kho</code> — <code>Hóa đơn NCC</code> phải khớp nhau trước khi thanh toán.</p><p>Áp dụng cho cả nhận hàng 1 lần đủ số lượng và nhận nhiều đợt (partial delivery / backorder).</p>"
        },
        {
          id: "db_purchase_5", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Khi PO chuyển <code>state=purchase</code>, hệ thống tự sinh <code>stock.picking</code> loại Incoming tại kho nhận của PO</li><li>Thủ kho mở phiếu nhập, nhập/scan <code>quantity</code> thực tế cho từng <code>stock.move</code></li><li>Bấm <b>Validate</b> — nếu thiếu số lượng, Odoo hỏi tạo <b>Backorder</b> cho phần còn lại hay đóng luôn</li><li>Từ PO, bấm <b>Create Bill</b> — số lượng lên hóa đơn theo <code>invoice_policy</code> (Ordered quantities / Received quantities)</li><li>Kế toán đối chiếu <code>amount_total</code> giữa PO và Bill trước khi <b>Post</b></li></ol>"
        },
        {
          id: "db_purchase_6", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Nếu <code>invoice_policy = \"receipt\"</code>, nút <b>Create Bill</b> chỉ cho lên hóa đơn đúng bằng số lượng đã <code>done</code> trên stock.move, không lấy theo <code>product_qty</code> đặt ban đầu</li><li>Lệch giá giữa PO và Bill quá <mark style='background:#FEF08A'>dung sai cấu hình (mặc định 0)</mark> sẽ chặn Post và yêu cầu xác nhận thủ công</li><li><code>invoice_status</code> trên PO tự chuyển <code>to invoice</code> ngay sau khi Receipt được validate (nếu policy theo received qty)</li><li>PO đã <b>Lock</b> (state=done) không cho sửa order_line, chỉ có thể tạo Bill bổ sung</li></ul>"
        }
      ],
      integrations: [
        { id: "int_purchase_4", module: "stock", icon: "ti-truck", color: "#D97706", direction: "out",
          content: "<p>PO xác nhận sinh <code>stock.picking</code> (Incoming) tại kho đích, mỗi dòng order_line sản phẩm storable → 1 <code>stock.move</code>.</p><p>Validate Receipt cập nhật tồn kho thực tế và giá vốn (theo phương pháp định giá của sản phẩm).</p>" },
        { id: "int_purchase_5", module: "account", icon: "ti-calculator", color: "#2563EB", direction: "out",
          content: "<p>Tạo <code>account.move</code> (type: in_invoice) từ PO, <code>invoice_origin</code> lưu số PO gốc để truy vết.</p><p>Post Bill sinh bút toán ghi nhận công nợ phải trả (Accounts Payable) cho NCC.</p>" },
        { id: "int_purchase_6", module: "product", icon: "ti-package", color: "#5BAA50", direction: "in",
          content: "<p>Nếu bật <b>Landed Costs</b>, chi phí vận chuyển/hải quan phân bổ thêm vào giá vốn sản phẩm sau khi Receipt được validate, ảnh hưởng ngược lại <code>standard_price</code> trên product.template.</p>" }
      ],
      notes: "Nên bật cảnh báo dung sai giá (Bill vs PO) trong Settings ▸ Invoicing để tránh kế toán post nhầm hóa đơn sai giá so với PO đã duyệt.",
      cases: [
        {
          id: "cs_purchase_2",
          title: "Vendor Bill lên đúng số tiền nhưng sai NCC được ghi nhận công nợ",
          status: "open",
          chatLink: "",
          description: "Kế toán tạo Bill từ PO nhưng khi Post, bút toán phải trả lại ghi nhận cho một mã NCC khác (công ty mẹ trong cùng group thương mại) thay vì đúng partner_id trên PO gốc.",
          images: [],
          cause: "Đang nghi ngờ liên quan đến partner NCC được cấu hình dạng 'Company' có nhiều Contact con dùng chung 1 property_account_payable_id — cần kiểm tra lại có phải Bill bị đổi partner_id thủ công lúc tạo, hay do commercial_partner_id gộp công nợ về công ty mẹ.",
          resolution: "Đang điều tra: yêu cầu kế toán không sửa tay partner_id trên Bill sau khi Create Bill tự động; kiểm tra cấu hình Company/Contact của NCC để xác nhận có đúng là hành vi 'gộp công nợ về công ty mẹ' theo thiết kế hay là lỗi thao tác."
        }
      ]
    }
  ]
});

export const STOCK = emptyModule({
  id: "mod_stock", name: "Inventory", tech: "stock",
  color: "#378ADD", status: "done", updatedAt: "2026-04-22",
  category: "Kho", depends: "base, product, mail",
  menu: "Inventory ▸ Operations ▸ Transfers",
  purpose: "Quản lý kho đa địa điểm, multi-step routes (pick/pack/ship), lot & serial, kiểm kê tồn.",
  features: [
    {
      id: "f_stock_1",
      name: "Quản lý phiếu xuất/nhập",
      desc: "Vòng đời stock.picking: từ nháp đến giao hàng, xử lý backorder",
      models: {
        cards: [
          {
            id: "mc_pick", name: "stock.picking", color: "#378ADD", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",          type: "Char",      desc: "Mã phiếu (WH/OUT/00001…)", req: true },
              { name: "picking_type_id", type: "Many2one", desc: "Loại thao tác kho",         req: true, relTo: "mc_ptype" },
              { name: "partner_id",    type: "Many2one",  desc: "Đối tác giao/nhận" },
              { name: "state",         type: "Selection", desc: "draft/waiting/confirmed/assigned/done/cancel" },
              { name: "scheduled_date",type: "Datetime",  desc: "Ngày dự kiến thực hiện",    req: true },
              { name: "origin",        type: "Char",      desc: "Chứng từ gốc (SO/PO/MO)" },
              { name: "move_ids",      type: "One2many",  desc: "Danh sách dịch chuyển kho", relTo: "mc_move" },
              { name: "backorder_id",  type: "Many2one",  desc: "Phiếu gốc (nếu là backorder)", relTo: "mc_pick" }
            ]
          },
          {
            id: "mc_move", name: "stock.move", color: "#5BAA50", x: 420, y: 40, width: 320,
            fields: [
              { name: "picking_id",    type: "Many2one",  desc: "Thuộc phiếu nào", req: true, relTo: "mc_pick" },
              { name: "product_id",    type: "Many2one",  desc: "Sản phẩm",        req: true },
              { name: "product_uom_qty", type: "Float",   desc: "SL kế hoạch (demand)", req: true },
              { name: "quantity",      type: "Float",     desc: "SL thực nhận/xuất" },
              { name: "location_id",   type: "Many2one",  desc: "Vị trí nguồn",    relTo: "mc_loc1" },
              { name: "location_dest_id", type: "Many2one", desc: "Vị trí đích",   relTo: "mc_loc1" },
              { name: "state",         type: "Selection", desc: "draft/…/done — kế thừa theo picking" },
              { name: "move_line_ids", type: "One2many",  desc: "Chi tiết theo lô/vị trí thực tế", relTo: "mc_moveline" }
            ]
          },
          {
            id: "mc_moveline", name: "stock.move.line", color: "#D97706", x: 420, y: 380, width: 320,
            fields: [
              { name: "move_id",       type: "Many2one",  desc: "Move gốc",      req: true, relTo: "mc_move" },
              { name: "product_id",    type: "Many2one",  desc: "Sản phẩm" },
              { name: "lot_id",        type: "Many2one",  desc: "Lot/Serial (nếu sản phẩm có tracking)" },
              { name: "quantity",      type: "Float",     desc: "SL thực tế quét/nhập" },
              { name: "location_id",   type: "Many2one",  desc: "Vị trí nguồn thực tế", relTo: "mc_loc1" },
              { name: "location_dest_id", type: "Many2one", desc: "Vị trí đích thực tế", relTo: "mc_loc1" }
            ]
          },
          {
            id: "mc_ptype", name: "stock.picking.type", color: "#7C3AED", x: 40, y: 380, width: 320,
            fields: [
              { name: "name",          type: "Char",      desc: "Nhận hàng / Giao hàng / Nội bộ", req: true },
              { name: "code",          type: "Selection", desc: "incoming/outgoing/internal",     req: true },
              { name: "sequence_id",   type: "Many2one",  desc: "Bộ đếm số phiếu" },
              { name: "default_location_src_id", type: "Many2one", desc: "Vị trí nguồn mặc định", relTo: "mc_loc1" },
              { name: "default_location_dest_id", type: "Many2one", desc: "Vị trí đích mặc định", relTo: "mc_loc1" },
              { name: "use_create_lots", type: "Boolean", desc: "Cho phép tạo lot mới khi nhận" }
            ]
          },
          {
            id: "mc_loc1", name: "stock.location", color: "#DC2626", x: 800, y: 210, width: 300,
            fields: [
              { name: "name",   type: "Char",      desc: "Tên vị trí (Stock/Input/Output)", req: true },
              { name: "usage",  type: "Selection", desc: "internal/customer/supplier/transit", req: true },
              { name: "warehouse_id", type: "Many2one", desc: "Thuộc kho nào" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_stock_1a",
          name: "Vòng đời phiếu xuất kho (Outgoing)",
          nodes: [
            { id: "on1",  type: "start",     label: "SO xác nhận → cần xuất kho",                     x: 40,   y: 200 },
            { id: "on2",  type: "task",      label: "Tạo stock.picking (draft) + stock.move",         x: 280,  y: 200 },
            { id: "on3",  type: "task",      label: "Check Availability — đặt trước tồn",             x: 520,  y: 200 },
            { id: "on4",  type: "gateway",   label: "Đủ tồn kho?",                                    x: 760,  y: 200 },
            { id: "on5",  type: "task",      label: "state = assigned (sẵn sàng xuất)",               x: 1000, y: 80  },
            { id: "on6",  type: "task",      label: "state = confirmed (waiting — chờ hàng)",         x: 1000, y: 340 },
            { id: "on7",  type: "user_task", label: "Thủ kho quét/nhập SL thực xuất (move_line)",     x: 1240, y: 80  },
            { id: "on8",  type: "gateway",   label: "Xuất đủ SL kế hoạch?",                           x: 1480, y: 80  },
            { id: "on9",  type: "task",      label: "Validate Transfer → state = done",               x: 1720, y: 0   },
            { id: "on10", type: "gateway",   label: "Tạo backorder cho phần thiếu?",                  x: 1720, y: 200 },
            { id: "on11", type: "end",       label: "Hoàn tất phiếu xuất, cập nhật stock.quant",      x: 1960, y: 0   },
            { id: "on12", type: "end",       label: "Backorder mới (draft) — chờ xuất tiếp",          x: 1960, y: 200 },
            { id: "on13", type: "end",       label: "Không backorder — huỷ phần còn thiếu",           x: 1960, y: 400 }
          ],
          edges: [
            { id: "oe1",  from: "on1",  to: "on2",  label: "" },
            { id: "oe2",  from: "on2",  to: "on3",  label: "" },
            { id: "oe3",  from: "on3",  to: "on4",  label: "" },
            { id: "oe4",  from: "on4",  to: "on5",  label: "Có" },
            { id: "oe5",  from: "on4",  to: "on6",  label: "Không đủ" },
            { id: "oe6",  from: "on6",  to: "on3",  label: "Hàng về, check lại" },
            { id: "oe7",  from: "on5",  to: "on7",  label: "" },
            { id: "oe8",  from: "on7",  to: "on8",  label: "" },
            { id: "oe9",  from: "on8",  to: "on9",  label: "Đủ" },
            { id: "oe10", from: "on8",  to: "on10", label: "Thiếu" },
            { id: "oe11", from: "on9",  to: "on11", label: "" },
            { id: "oe12", from: "on10", to: "on12", label: "Có" },
            { id: "oe13", from: "on10", to: "on13", label: "Không" }
          ]
        },
        {
          id: "fl_stock_1b",
          name: "Nhận hàng nhập kho (Incoming)",
          nodes: [
            { id: "in1", type: "start",     label: "PO xác nhận → cần nhập kho",                x: 40,   y: 160 },
            { id: "in2", type: "task",      label: "Tạo stock.picking (Incoming, draft)",       x: 280,  y: 160 },
            { id: "in3", type: "task",      label: "Hàng về kho — chuyển sang ready",           x: 520,  y: 160 },
            { id: "in4", type: "user_task", label: "Thủ kho kiểm đếm & nhập SL thực nhận",      x: 760,  y: 160 },
            { id: "in5", type: "gateway",   label: "Nhận đủ theo PO?",                          x: 1000, y: 160 },
            { id: "in6", type: "task",      label: "Validate → done, cộng tồn kho",             x: 1240, y: 40  },
            { id: "in7", type: "task",      label: "Tạo backorder chờ nhận phần thiếu",         x: 1240, y: 300 },
            { id: "in8", type: "end",       label: "Nhập kho hoàn tất",                         x: 1480, y: 40  },
            { id: "in9", type: "end",       label: "Chờ nhận đợt sau (backorder)",              x: 1480, y: 300 }
          ],
          edges: [
            { id: "ie1", from: "in1", to: "in2", label: "" },
            { id: "ie2", from: "in2", to: "in3", label: "" },
            { id: "ie3", from: "in3", to: "in4", label: "" },
            { id: "ie4", from: "in4", to: "in5", label: "" },
            { id: "ie5", from: "in5", to: "in6", label: "Đủ" },
            { id: "ie6", from: "in5", to: "in7", label: "Thiếu" },
            { id: "ie7", from: "in6", to: "in8", label: "" },
            { id: "ie8", from: "in7", to: "in9", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_stock_1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p><code>stock.picking</code> là chứng từ trung tâm cho mọi dịch chuyển vật lý của hàng hoá — Nhận hàng, Giao hàng, hoặc chuyển kho nội bộ — đều dùng chung 1 model, phân biệt nhau qua <code>picking_type_id</code>.</p><p>Mỗi picking có thể chứa nhiều <code>stock.move</code> (theo sản phẩm) và mỗi move lại có thể tách thành nhiều <code>stock.move.line</code> (theo lô/vị trí thực tế khi thao tác qua Barcode app).</p>"
        },
        {
          id: "db_stock_2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Phiếu được tạo tự động từ SO/PO/MO, hoặc tạo tay ở menu <b>Transfers</b></li><li>Bấm <b>Check Availability</b> để hệ thống đặt trước tồn kho (reservation) theo chiến lược lấy hàng cấu hình (FIFO/FEFO/LIFO)</li><li>Thủ kho xử lý qua Barcode app (quét mã) hoặc nhập tay số lượng thực tế trên form</li><li>Bấm <b>Validate</b> — nếu số lượng thực tế &lt; kế hoạch, hệ thống hỏi tạo <b>Backorder</b> cho phần còn thiếu</li><li>Khi phiếu đạt <code>state = done</code>, <code>stock.quant</code> được cập nhật ngay lập tức</li></ol>"
        },
        {
          id: "db_stock_3", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Chính sách backorder cấu hình theo <code>picking_type_id</code>: <mark style='background:#FEF08A'>Always / Ask / Never create Backorder</mark></li><li>State máy trạng thái không cho nhảy cóc: <code>draft → waiting/confirmed → assigned → done</code>, chỉ <code>assigned</code> mới validate được (trừ khi bật No Backorder cưỡng bức)</li><li>Không cho phép tồn âm trừ khi tick <code>allow_negative_stock</code> trên location — mặc định Odoo 18 chặn xuất vượt tồn thực</li><li><code>scheduled_date</code> quyết định độ ưu tiên hiển thị trên danh sách Transfers và Barcode app</li></ul>"
        }
      ],
      integrations: [
        { id: "int_stock_1", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "in",
          content: "<p>Khi xác nhận <code>sale.order</code>, hệ thống tự tạo <code>stock.picking</code> loại Outgoing theo <code>warehouse_id</code> của đơn, mỗi <code>order_line</code> sinh 1 <code>stock.move</code> tương ứng.</p>" },
        { id: "int_stock_2", module: "purchase", icon: "ti-shopping-bag", color: "#D97706", direction: "in",
          content: "<p>Xác nhận <code>purchase.order</code> sinh phiếu Incoming, số lượng dự kiến lấy từ <code>purchase.order.line</code>. Sai lệch giá khi hoá đơn hoá đối chiếu qua Landed Costs (nếu bật).</p>" },
        { id: "int_stock_3", module: "mrp", icon: "ti-tool", color: "#DC2626", direction: "bidi",
          content: "<p>Lệnh sản xuất tiêu thụ nguyên liệu (component moves, location Stock → Production) và nhập kho thành phẩm (Production → Stock) — cả hai đều đi qua <code>stock.move</code> chuẩn.</p>" }
      ],
      notes: "Cân nhắc bật Barcode app cho thủ kho thay vì nhập tay trên form — giảm sai số kiểm đếm đáng kể khi số dòng move lớn.",
      cases: [
        {
          id: "cs_stock_1",
          title: "Phiếu xuất kho không tự tạo backorder khi thiếu hàng",
          status: "resolved",
          chatLink: "",
          description: "Thủ kho validate phiếu xuất chỉ đủ 8/10 sản phẩm, bấm Validate xong hệ thống đóng luôn phiếu — 2 sản phẩm còn thiếu biến mất khỏi danh sách cần xuất, không thấy backorder nào được tạo.",
          images: [],
          cause: "Picking Type 'Delivery' của kho này bị cấu hình Backorders = 'No Backorders', nên Odoo tự huỷ phần số lượng chưa giao thay vì hỏi tạo backorder.",
          resolution: "Vào Inventory ▸ Configuration ▸ Operations Types, mở 'Delivery Orders', đổi mục Backorders sang 'Ask' (hoặc 'Always Create Backorder' nếu muốn tự động, không cần hỏi lại)."
        }
      ]
    },
    {
      id: "f_stock_2",
      name: "Lot & Serial tracking",
      desc: "Truy vết theo lô/serial, hạn dùng và chiến lược FEFO",
      models: {
        cards: [
          {
            id: "mc_lot", name: "stock.lot", color: "#378ADD", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",            type: "Char",     desc: "Số lô / Serial number", req: true },
              { name: "product_id",      type: "Many2one", desc: "Sản phẩm gắn lô này",   req: true, relTo: "mc_product2" },
              { name: "product_qty",     type: "Float",    desc: "SL tồn hiện tại của lô (computed)" },
              { name: "expiration_date", type: "Datetime", desc: "Hạn sử dụng — dùng cho chiến lược FEFO" },
              { name: "note",            type: "Text",     desc: "Ghi chú (NCC, ngày sản xuất…)" }
            ]
          },
          {
            id: "mc_moveline2", name: "stock.move.line", color: "#D97706", x: 420, y: 40, width: 320,
            fields: [
              { name: "product_id",  type: "Many2one", desc: "Sản phẩm",              req: true, relTo: "mc_product2" },
              { name: "lot_id",      type: "Many2one", desc: "Lot/Serial được chọn",  req: true, relTo: "mc_lot" },
              { name: "quantity",    type: "Float",    desc: "SL thực nhận/xuất theo lô này" },
              { name: "location_id", type: "Many2one", desc: "Vị trí nguồn" },
              { name: "location_dest_id", type: "Many2one", desc: "Vị trí đích" }
            ]
          },
          {
            id: "mc_product2", name: "product.product", color: "#7C3AED", x: 420, y: 380, width: 320,
            fields: [
              { name: "name",          type: "Char",      desc: "Tên sản phẩm",  req: true },
              { name: "tracking",      type: "Selection", desc: "none / lot / serial", req: true },
              { name: "detailed_type", type: "Selection", desc: "storable — bắt buộc để bật tracking" },
              { name: "lot_ids",       type: "One2many",  desc: "Các lô/serial đã phát sinh", relTo: "mc_lot" }
            ]
          },
          {
            id: "mc_quant", name: "stock.quant", color: "#5BAA50", x: 40, y: 380, width: 320,
            fields: [
              { name: "product_id",  type: "Many2one", desc: "Sản phẩm",  relTo: "mc_product2" },
              { name: "lot_id",      type: "Many2one", desc: "Lô/Serial", relTo: "mc_lot" },
              { name: "location_id", type: "Many2one", desc: "Vị trí lưu trữ hiện tại" },
              { name: "quantity",    type: "Float",    desc: "SL tồn theo lô tại vị trí này" },
              { name: "reserved_quantity", type: "Float", desc: "SL đã bị đặt trước bởi phiếu khác" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_stock_2a",
          name: "Gán Lot/Serial khi nhận hàng",
          nodes: [
            { id: "ln1", type: "start",     label: "Phiếu nhập kho tới bước kiểm đếm",              x: 40,   y: 200 },
            { id: "ln2", type: "gateway",   label: "Sản phẩm có bật tracking?",                     x: 280,  y: 200 },
            { id: "ln3", type: "task",      label: "Không cần lot — nhập thẳng SL",                 x: 520,  y: 40  },
            { id: "ln4", type: "gateway",   label: "Serial (từng cái) hay Lot (theo lô)?",          x: 520,  y: 360 },
            { id: "ln5", type: "user_task", label: "Quét từng Serial — mỗi SN = 1 move_line",       x: 760,  y: 220 },
            { id: "ln6", type: "user_task", label: "Nhập số Lot + số lượng theo lô",                x: 760,  y: 480 },
            { id: "ln7", type: "task",      label: "Tạo/ghi nhận stock.lot nếu chưa tồn tại",       x: 1000, y: 340 },
            { id: "ln8", type: "task",      label: "Cập nhật stock.quant theo lot_id",              x: 1240, y: 340 },
            { id: "ln9", type: "end",       label: "Tồn kho có truy vết đầy đủ theo lô/serial",     x: 1480, y: 200 }
          ],
          edges: [
            { id: "le1", from: "ln1", to: "ln2", label: "" },
            { id: "le2", from: "ln2", to: "ln3", label: "Không" },
            { id: "le3", from: "ln2", to: "ln4", label: "Có" },
            { id: "le4", from: "ln4", to: "ln5", label: "Serial" },
            { id: "le5", from: "ln4", to: "ln6", label: "Lot" },
            { id: "le6", from: "ln5", to: "ln7", label: "" },
            { id: "le7", from: "ln6", to: "ln7", label: "" },
            { id: "le8", from: "ln7", to: "ln8", label: "" },
            { id: "le9", from: "ln8", to: "ln9", label: "" },
            { id: "le10", from: "ln3", to: "ln9", label: "" }
          ]
        },
        {
          id: "fl_stock_2b",
          name: "Truy vết theo Lot (Traceability Report)",
          nodes: [
            { id: "tn1", type: "start",   label: "Khách khiếu nại lô sản phẩm lỗi",                x: 40,   y: 160 },
            { id: "tn2", type: "task",    label: "Tìm stock.lot theo số lô in trên bao bì",        x: 280,  y: 160 },
            { id: "tn3", type: "task",    label: "Mở Traceability Report từ form Lot",             x: 520,  y: 160 },
            { id: "tn4", type: "gateway", label: "Truy ngược (nguồn gốc) hay truy xuôi (đã bán)?",  x: 760,  y: 160 },
            { id: "tn5", type: "task",    label: "Xem move nhập kho gốc → NCC / PO",               x: 1000, y: 40  },
            { id: "tn6", type: "task",    label: "Xem move xuất kho → khách hàng / SO đã nhận lô", x: 1000, y: 280 },
            { id: "tn7", type: "end",     label: "Xác định phạm vi ảnh hưởng để thu hồi/cảnh báo", x: 1240, y: 160 }
          ],
          edges: [
            { id: "te1", from: "tn1", to: "tn2", label: "" },
            { id: "te2", from: "tn2", to: "tn3", label: "" },
            { id: "te3", from: "tn3", to: "tn4", label: "" },
            { id: "te4", from: "tn4", to: "tn5", label: "Truy ngược" },
            { id: "te5", from: "tn4", to: "tn6", label: "Truy xuôi" },
            { id: "te6", from: "tn5", to: "tn7", label: "" },
            { id: "te7", from: "tn6", to: "tn7", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_stock_4", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Bật trường <code>tracking</code> trên <code>product.template</code> (No Tracking / By Lots / By Unique Serial Number) để yêu cầu khai báo lô/serial mỗi lần nhập-xuất.</p><p>Bắt buộc với ngành <b>dược phẩm, thực phẩm, mỹ phẩm</b> — cần chiến lược lấy hàng <b>FEFO</b> (First Expired, First Out) dựa trên <code>expiration_date</code> thay vì FIFO thông thường.</p>"
        },
        {
          id: "db_stock_5", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Bật module <b>Lots &amp; Serial Numbers</b> tại Inventory ▸ Configuration ▸ Settings</li><li>Trên product, chọn <code>tracking = lot</code> hoặc <code>serial</code></li><li>Khi nhận hàng, thủ kho nhập/quét số lô hoặc dải serial (có thể dùng nút <b>Assign Serial Numbers</b> để sinh tự động dải liên tục)</li><li>Khi xuất, chọn đúng lô theo gợi ý FEFO/FIFO của hệ thống</li><li>Tra cứu lịch sử qua menu <b>Inventory ▸ Reporting ▸ Traceability</b> hoặc mở thẳng từ form Lot</li></ol>"
        },
        {
          id: "db_stock_6", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Với <code>tracking = serial</code>, mỗi <code>stock.move.line</code> chỉ được phép <mark style='background:#FEF08A'>quantity = 1</mark> — không gộp số lượng</li><li>Số lô có thể trùng giữa các sản phẩm khác nhau nhưng nên bật <code>unique lot per company</code> để tránh nhầm lẫn khi quét barcode</li><li>Chiến lược FEFO chỉ áp dụng được khi location cấu hình <code>removal_strategy_id = FEFO</code> — mặc định Odoo dùng FIFO</li></ul>"
        }
      ],
      integrations: [
        { id: "int_stock_4", module: "purchase", icon: "ti-shopping-bag", color: "#D97706", direction: "in",
          content: "<p>Nhà cung cấp giao hàng kèm số lô/hạn dùng — thủ kho nhập trực tiếp vào <code>stock.lot</code> ngay tại bước Validate phiếu nhận, không cần thao tác riêng.</p>" },
        { id: "int_stock_5", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "out",
          content: "<p>Phiếu giao hàng in kèm số lô/serial đã xuất cho từng khách — phục vụ tra cứu khi có khiếu nại hoặc thu hồi sản phẩm (recall).</p>" },
        { id: "int_stock_6", module: "mrp", icon: "ti-tool", color: "#DC2626", direction: "bidi",
          content: "<p>Nguyên liệu theo lô được tiêu thụ vào lệnh sản xuất; thành phẩm sinh lô mới nhưng vẫn giữ liên kết truy vết ngược tới lô nguyên liệu qua <code>Manufacturing Traceability</code>.</p>" }
      ],
      notes: "Với khách hàng ngành dược, nên bật cảnh báo Alert Date (trước Expiration Date N ngày) để kho chủ động xử lý hàng cận date trước khi hết hạn.",
      cases: [
        {
          id: "cs_stock_2",
          title: "Không thể validate phiếu giao vì thiếu số Serial",
          status: "resolved",
          chatLink: "",
          description: "Nhân viên bán hàng validate phiếu xuất kho cho 5 sản phẩm tracking=serial nhưng hệ thống báo lỗi chặn, yêu cầu nhập đủ serial cho từng đơn vị trong khi thủ kho chỉ nhập một dòng số lượng = 5.",
          images: [],
          cause: "Sản phẩm cấu hình tracking = serial (mỗi đơn vị 1 số riêng) nhưng thủ kho thao tác như hàng theo lô — nhập gộp số lượng vào 1 move_line thay vì tách 5 serial riêng biệt.",
          resolution: "Hướng dẫn dùng nút 'Assign Serial Numbers' trên tab Operations để hệ thống tự tách 5 dòng move_line theo dải serial có sẵn, hoặc quét lần lượt từng sản phẩm qua Barcode app."
        }
      ]
    },
    {
      id: "f_stock_3",
      name: "Multi-warehouse & Routes",
      desc: "Định tuyến nhiều kho, push/pull rules, quy trình Pick-Pack-Ship",
      models: {
        cards: [
          {
            id: "mc_wh", name: "stock.warehouse", color: "#378ADD", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",            type: "Char",      desc: "Tên kho",                     req: true },
              { name: "code",            type: "Char",      desc: "Mã kho (vd. WH, HN, HCM)",     req: true },
              { name: "partner_id",      type: "Many2one",  desc: "Địa chỉ kho" },
              { name: "delivery_steps",  type: "Selection", desc: "ship_only / pick_ship / pick_pack_ship", req: true },
              { name: "reception_steps", type: "Selection", desc: "one_step / two_steps / three_steps" },
              { name: "route_ids",       type: "One2many",  desc: "Các route thuộc kho này",      relTo: "mc_route" }
            ]
          },
          {
            id: "mc_route", name: "stock.route", color: "#7C3AED", x: 420, y: 40, width: 320,
            fields: [
              { name: "name",               type: "Char",     desc: "Tên tuyến (Buy / Manufacture / Pick+Pack+Ship)", req: true },
              { name: "rule_ids",           type: "One2many", desc: "Danh sách rule của route", req: true, relTo: "mc_rule" },
              { name: "warehouse_selectable", type: "Boolean", desc: "Cho phép gán route theo kho" },
              { name: "product_selectable", type: "Boolean",  desc: "Cho phép gán route trên từng sản phẩm" },
              { name: "sequence",           type: "Integer",  desc: "Thứ tự ưu tiên khi nhiều route cùng áp dụng" }
            ]
          },
          {
            id: "mc_rule", name: "stock.rule", color: "#D97706", x: 420, y: 400, width: 320,
            fields: [
              { name: "name",            type: "Char",      desc: "Tên rule",                    req: true },
              { name: "action",          type: "Selection", desc: "pull / push / pull_push",      req: true },
              { name: "route_id",        type: "Many2one",  desc: "Thuộc route nào",  req: true,  relTo: "mc_route" },
              { name: "location_src_id", type: "Many2one",  desc: "Vị trí nguồn",     relTo: "mc_loc2" },
              { name: "location_dest_id", type: "Many2one", desc: "Vị trí đích",      relTo: "mc_loc2" },
              { name: "procure_method",  type: "Selection", desc: "make_to_stock / make_to_order" }
            ]
          },
          {
            id: "mc_loc2", name: "stock.location", color: "#5BAA50", x: 40, y: 400, width: 320,
            fields: [
              { name: "name",         type: "Char",      desc: "Tên vị trí (Stock/Input/Output/Pack)", req: true },
              { name: "usage",        type: "Selection", desc: "internal/customer/supplier/view/transit", req: true },
              { name: "location_id",  type: "Many2one",  desc: "Vị trí cha (cây vị trí)", relTo: "mc_loc2" },
              { name: "warehouse_id", type: "Many2one",  desc: "Thuộc kho nào",           relTo: "mc_wh" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_stock_3a",
          name: "Route 3 bước: Pick → Pack → Ship",
          nodes: [
            { id: "rn1", type: "start",     label: "SO xác nhận, kho cấu hình delivery_steps=pick_pack_ship", x: 40,   y: 160 },
            { id: "rn2", type: "task",      label: "Pull Rule 1: Stock → Output — tạo picking Pick",          x: 280,  y: 160 },
            { id: "rn3", type: "user_task", label: "Thủ kho lấy hàng tại Stock, chuyển vào khu Pack",         x: 520,  y: 160 },
            { id: "rn4", type: "task",      label: "Validate Pick → kích hoạt Pull Rule 2 (Pack)",            x: 760,  y: 160 },
            { id: "rn5", type: "user_task", label: "Đóng gói tại khu Pack",                                   x: 1000, y: 160 },
            { id: "rn6", type: "task",      label: "Validate Pack → kích hoạt Pull Rule 3 (Ship)",            x: 1240, y: 160 },
            { id: "rn7", type: "user_task", label: "Xuất hàng khỏi kho, bàn giao vận chuyển",                 x: 1480, y: 160 },
            { id: "rn8", type: "end",       label: "Validate Ship → done, trừ khỏi tồn kho",                  x: 1720, y: 160 }
          ],
          edges: [
            { id: "re1", from: "rn1", to: "rn2", label: "" },
            { id: "re2", from: "rn2", to: "rn3", label: "" },
            { id: "re3", from: "rn3", to: "rn4", label: "" },
            { id: "re4", from: "rn4", to: "rn5", label: "" },
            { id: "re5", from: "rn5", to: "rn6", label: "" },
            { id: "re6", from: "rn6", to: "rn7", label: "" },
            { id: "re7", from: "rn7", to: "rn8", label: "" }
          ]
        },
        {
          id: "fl_stock_3b",
          name: "Điều chuyển liên kho (HCM → HN) qua Push Rule",
          nodes: [
            { id: "wtn1", type: "start",     label: "Kho HN thiếu hàng, kho HCM còn tồn",                  x: 40,   y: 200 },
            { id: "wtn2", type: "task",      label: "Route 'Điều chuyển HCM→HN' với Push Rule",            x: 280,  y: 200 },
            { id: "wtn3", type: "gateway",   label: "Kích hoạt tự động (min/max) hay thủ công?",           x: 520,  y: 200 },
            { id: "wtn4", type: "task",      label: "Reordering Rule tự tạo nhu cầu bổ sung",              x: 760,  y: 60  },
            { id: "wtn5", type: "user_task", label: "Điều phối viên tạo Internal Transfer thủ công",       x: 760,  y: 340 },
            { id: "wtn6", type: "task",      label: "Push Rule sinh stock.picking Outgoing tại HCM",       x: 1000, y: 200 },
            { id: "wtn7", type: "task",      label: "Vận chuyển liên kho (Inter-warehouse transit)",       x: 1240, y: 200 },
            { id: "wtn8", type: "task",      label: "Push Rule tiếp theo sinh Incoming Picking tại HN",    x: 1480, y: 200 },
            { id: "wtn9", type: "end",       label: "Nhập kho HN hoàn tất, tồn kho 2 đầu cập nhật",        x: 1720, y: 200 }
          ],
          edges: [
            { id: "wte1", from: "wtn1", to: "wtn2", label: "" },
            { id: "wte2", from: "wtn2", to: "wtn3", label: "" },
            { id: "wte3", from: "wtn3", to: "wtn4", label: "Tự động" },
            { id: "wte4", from: "wtn3", to: "wtn5", label: "Thủ công" },
            { id: "wte5", from: "wtn4", to: "wtn6", label: "" },
            { id: "wte6", from: "wtn5", to: "wtn6", label: "" },
            { id: "wte7", from: "wtn6", to: "wtn7", label: "" },
            { id: "wte8", from: "wtn7", to: "wtn8", label: "" },
            { id: "wte9", from: "wtn8", to: "wtn9", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_stock_7", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Mỗi <code>stock.warehouse</code> sở hữu một cây <code>stock.location</code> riêng (Stock, Input, Output, Pack, QC…). <code>stock.route</code> + <code>stock.rule</code> định nghĩa hàng hoá <b>di chuyển vật lý</b> qua các vị trí đó như thế nào — từ giao hàng nội bộ đơn giản đến drop-ship, cross-dock, hay điều chuyển giữa nhiều kho.</p>"
        },
        {
          id: "db_stock_8", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Khai báo kho tại Inventory ▸ Configuration ▸ Warehouses, chọn số bước <code>delivery_steps</code>/<code>reception_steps</code></li><li>Odoo tự sinh route + rule mặc định tương ứng (vd Pick+Pack+Ship sinh 3 rule pull nối tiếp)</li><li>Tạo route tuỳ chỉnh cho nhu cầu riêng (vd điều chuyển liên kho), gán <code>warehouse_selectable</code> hoặc <code>product_selectable</code></li><li>Gán route cho sản phẩm/category/kho tại tab Inventory của product</li><li>Cấu hình <b>Reordering Rules</b> (min/max) tại vị trí kho nhận để tự động sinh nhu cầu bổ sung liên kho</li></ol>"
        },
        {
          id: "db_stock_9", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li><b>Pull Rule</b> kéo nhu cầu ngược từ đích về nguồn (đơn hàng khách → kéo hàng từ Output → Pack → Stock)</li><li><b>Push Rule</b> đẩy hàng tới bước kế tiếp ngay khi bước trước hoàn tất (thường dùng cho điều chuyển liên kho)</li><li>Mỗi bước trong route sinh <mark style='background:#FEF08A'>1 stock.picking riêng biệt</mark> — không gộp chung, giúp truy vết từng công đoạn (pick/pack/ship)</li><li>Cấu hình sai <code>location_src_id = location_dest_id</code> trên rule có thể tạo vòng lặp route vô hạn — cần kiểm tra kỹ khi tạo route tuỳ chỉnh</li></ul>"
        }
      ],
      integrations: [
        { id: "int_stock_7", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "in",
          content: "<p>Route gán trên sản phẩm/kho quyết định picking nào được sinh khi xác nhận SO — vd route <b>Dropship</b> bỏ qua kho, tạo thẳng phiếu giao từ nhà cung cấp tới khách.</p>" },
        { id: "int_stock_8", module: "purchase", icon: "ti-shopping-bag", color: "#D97706", direction: "bidi",
          content: "<p>Route <b>Buy</b> tự sinh RFQ khi Reordering Rule kích hoạt tại vị trí kho thiếu hàng — dùng chung cơ chế với điều chuyển liên kho nhưng nguồn là nhà cung cấp thay vì kho khác.</p>" },
        { id: "int_stock_9", module: "mrp", icon: "ti-tool", color: "#DC2626", direction: "in",
          content: "<p>Route <b>Manufacture</b> định tuyến nguyên liệu tới vị trí sản xuất riêng của từng kho, cho phép mỗi warehouse có xưởng sản xuất và luồng cung ứng độc lập.</p>" }
      ],
      notes: "Khi setup điều chuyển liên kho cho khách hàng nhiều chi nhánh, nên đặt tên route rõ ràng theo chiều (vd 'HCM → HN') thay vì dùng chung 1 route 2 chiều — tránh nhầm lẫn khi debug push rule.",
      cases: [
        {
          id: "cs_stock_3",
          title: "Điều chuyển liên kho bị kẹt ở bước Transit, không lên tồn kho đích",
          status: "investigating",
          chatLink: "",
          description: "Hàng chuyển từ kho HCM sang kho HN: phiếu xuất tại HCM đã Validate xong (state=done) nhưng phiếu nhập tại HN không tự sinh, tồn kho HN không tăng dù hàng đã lên xe.",
          images: [],
          cause: "Vị trí trung gian 'Inter-warehouse transit' chưa được set đúng usage=transit, hoặc thiếu Push Rule nối tiếp giữa route xuất (HCM) và route nhập (HN) cùng trỏ về vị trí transit đó — khiến move dừng lại giữa chừng thay vì kích hoạt rule kế tiếp.",
          resolution: "Đang kiểm tra lại cấu hình 2 route riêng biệt (HCM Export + HN Import), đảm bảo cả hai cùng trỏ về đúng 1 transit location và Push Rule phía HN được set 'Propagate' đúng để tự sinh Incoming Picking khi hàng tới transit."
        }
      ]
    }
  ]
});

export const ACCOUNT = emptyModule({
  id: "mod_account", name: "Accounting", tech: "account",
  color: "#7F77DD", status: "studying", updatedAt: "2026-05-11",
  category: "Kế toán", depends: "base, mail, product",
  menu: "Accounting ▸ Customers ▸ Invoices",
  purpose: "Sổ kế toán đôi đầy đủ: invoice, payment, reconciliation, báo cáo BCTC, multi-currency, multi-company.",
  features: [
    {
      id: "f_acc_1",
      name: "Hóa đơn bán & mua",
      desc: "Tạo, kiểm tra, ghi sổ (post) hóa đơn khách hàng & nhà cung cấp, xử lý credit note",
      models: {
        cards: [
          {
            id: "mc_move", name: "account.move", color: "#7F77DD", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",             type: "Char",      desc: "Số hóa đơn / số bút toán (auto theo sequence)", req: true },
              { name: "move_type",        type: "Selection", desc: "out_invoice / in_invoice / out_refund / in_refund", req: true },
              { name: "partner_id",       type: "Many2one",  desc: "Khách hàng (bán) / Nhà cung cấp (mua)", req: true, relTo: "mc_partneracc" },
              { name: "invoice_date",     type: "Date",      desc: "Ngày hóa đơn", req: true },
              { name: "state",            type: "Selection", desc: "draft / posted / cancel" },
              { name: "invoice_line_ids", type: "One2many",  desc: "Chi tiết dòng hóa đơn", relTo: "mc_moveline" },
              { name: "amount_total",     type: "Monetary",  desc: "Tổng tiền (đã gồm thuế)" },
              { name: "amount_residual",  type: "Monetary",  desc: "Số tiền còn phải thu / phải trả" }
            ]
          },
          {
            id: "mc_moveline", name: "account.move.line", color: "#378ADD", x: 440, y: 40, width: 320,
            fields: [
              { name: "move_id",        type: "Many2one",  desc: "Hóa đơn / bút toán gốc", req: true, relTo: "mc_move" },
              { name: "product_id",     type: "Many2one",  desc: "Sản phẩm / dịch vụ" },
              { name: "name",           type: "Char",      desc: "Diễn giải dòng" },
              { name: "quantity",       type: "Float",     desc: "Số lượng" },
              { name: "price_unit",     type: "Float",     desc: "Đơn giá" },
              { name: "tax_ids",        type: "Many2many", desc: "Thuế VAT áp dụng (0%/5%/8%/10%)" },
              { name: "account_id",     type: "Many2one",  desc: "Tài khoản kế toán ghi nhận", req: true, relTo: "mc_accountacc" },
              { name: "price_subtotal", type: "Monetary",  desc: "Thành tiền chưa thuế" },
              { name: "price_total",    type: "Monetary",  desc: "Thành tiền đã gồm thuế" }
            ]
          },
          {
            id: "mc_accountacc", name: "account.account", color: "#D97706", x: 440, y: 340, width: 300,
            fields: [
              { name: "code",         type: "Char",      desc: "Mã tài khoản (vd 131, 331, 511)", req: true },
              { name: "name",         type: "Char",      desc: "Tên tài khoản", req: true },
              { name: "account_type", type: "Selection", desc: "asset_receivable / liability_payable / income / expense" },
              { name: "reconcile",    type: "Boolean",   desc: "Cho phép đối chiếu công nợ (bắt buộc với 131/331)" }
            ]
          },
          {
            id: "mc_partneracc", name: "res.partner", color: "#D85A30", x: 40, y: 360, width: 300,
            fields: [
              { name: "name",                        type: "Char",     desc: "Tên khách hàng / NCC", req: true },
              { name: "vat",                          type: "Char",     desc: "Mã số thuế" },
              { name: "property_account_receivable_id", type: "Many2one", desc: "TK phải thu mặc định (131)" },
              { name: "property_account_payable_id",    type: "Many2one", desc: "TK phải trả mặc định (331)" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_acc_1",
          name: "Từ hóa đơn nháp đến ghi sổ & điều chỉnh",
          nodes: [
            { id: "an1",  type: "start",    label: "Tạo hóa đơn nháp (draft)",                x: 40,   y: 140 },
            { id: "an2",  type: "task",     label: "Nhập dòng hóa đơn, chọn thuế VAT",        x: 280,  y: 140 },
            { id: "an3",  type: "gateway",  label: "Số liệu đã khớp hợp đồng/PO?",            x: 520,  y: 140 },
            { id: "an3b", type: "task",     label: "Sửa lại dòng hóa đơn",                    x: 520,  y: 320 },
            { id: "an4",  type: "task",     label: "Post hóa đơn (Confirm)",                  x: 760,  y: 140 },
            { id: "an5",  type: "gateway",  label: "Cần xuất hóa đơn điều chỉnh?",            x: 1000, y: 140 },
            { id: "an6",  type: "task",     label: "Tạo Credit/Debit Note liên kết hóa đơn gốc", x: 1240, y: 40 },
            { id: "an7",  type: "end",      label: "Hóa đơn hoàn tất — chờ thanh toán",       x: 1240, y: 240 },
            { id: "an8",  type: "end",      label: "Đã điều chỉnh qua Credit/Debit Note",     x: 1480, y: 40 }
          ],
          edges: [
            { id: "ae1", from: "an1",  to: "an2",  label: "" },
            { id: "ae2", from: "an2",  to: "an3",  label: "" },
            { id: "ae3", from: "an3",  to: "an3b", label: "Chưa khớp" },
            { id: "ae4", from: "an3b", to: "an2",  label: "" },
            { id: "ae5", from: "an3",  to: "an4",  label: "Khớp" },
            { id: "ae6", from: "an4",  to: "an5",  label: "" },
            { id: "ae7", from: "an5",  to: "an6",  label: "Có" },
            { id: "ae8", from: "an5",  to: "an7",  label: "Không" },
            { id: "ae9", from: "an6",  to: "an8",  label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_acc_1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Ghi nhận đầy đủ hóa đơn <b>bán ra</b> (out_invoice) và <b>mua vào</b> (in_invoice) trên cùng model <code>account.move</code>, đảm bảo dữ liệu đầu vào cho báo cáo thuế GTGT và BCTC.</p><p>Áp dụng cho cả hóa đơn tạo tay (kế toán nhập trực tiếp) và hóa đơn sinh tự động từ <code>sale.order</code> / <code>purchase.order</code>.</p>"
        },
        {
          id: "db_acc_2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Tạo <code>account.move</code> (draft) — thủ công hoặc từ nút <b>Create Bill/Invoice</b> trên SO/PO</li><li>Nhập/kiểm tra <code>invoice_line_ids</code>: sản phẩm, số lượng, đơn giá, thuế VAT theo từng dòng</li><li>Kiểm tra <code>partner_id</code> đã map đúng <code>property_account_receivable_id</code>/<code>property_account_payable_id</code></li><li>Bấm <b>Confirm</b> để post — state chuyển <code>posted</code>, sinh bút toán Nợ/Có tương ứng, khóa sửa các trường kế toán</li><li>Nếu cần điều chỉnh giảm/tăng sau khi post → dùng <b>Credit Note</b>/<b>Debit Note</b>, không sửa trực tiếp hóa đơn đã post</li></ol>"
        },
        {
          id: "db_acc_3", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Hóa đơn đã <code>posted</code> là bất biến (immutable) — mọi điều chỉnh phải qua Credit/Debit Note để giữ dấu vết audit</li><li>Thuế VAT tính theo <mark style='background:#FEF08A'>Round per Line</mark> (mặc định VN) hoặc <b>Round Globally</b> — hai công ty dùng khác cấu hình sẽ cho <code>amount_total</code> lệch vài đồng khi nhiều dòng</li><li>Hóa đơn ngoại tệ (khác <code>company_currency_id</code>) ghi nhận theo tỷ giá ngày <code>invoice_date</code>, lưu lại <code>amount_currency</code> song song với giá trị quy đổi VND</li><li><code>account_id</code> trên từng dòng phải thuộc nhóm tài khoản doanh thu/chi phí phù hợp — không được trỏ thẳng vào TK phải thu/phải trả</li></ul>"
        }
      ],
      integrations: [
        { id: "int_acc_1", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "in",
          content: "<p>Hóa đơn bán được sinh từ <code>sale.order</code> qua nút <b>Create Invoice</b> (full hoặc theo % / theo mốc giao hàng tùy <code>invoice_policy</code>).</p><p><code>sale.order.line</code> map 1-1 sang <code>account.move.line</code>, giữ nguyên <code>product_id</code>, đơn giá, chiết khấu và thuế.</p>" },
        { id: "int_acc_2", module: "purchase", icon: "ti-shopping-bag", color: "#D97706", direction: "in",
          content: "<p>Hóa đơn mua (vendor bill) sinh từ <code>purchase.order</code> qua nút <b>Create Bill</b>, đối chiếu số lượng đã nhận (<code>qty_received</code>) trước khi cho phép hóa đơn hóa toàn bộ.</p>" },
        { id: "int_acc_3", module: "stock", icon: "ti-package", color: "#2563EB", direction: "in",
          content: "<p>Với sản phẩm dùng <b>perpetual valuation</b>, khi hóa đơn NCC post sẽ so khớp giá trên hóa đơn với giá trị nhập kho (<code>stock.valuation.layer</code>) — chênh lệch ghi nhận vào TK <b>Price Difference</b>.</p>" }
      ],
      notes: "Cân nhắc bật 'Lock Posted Entries' theo kỳ để tránh sửa/xóa hóa đơn của kỳ đã khóa sổ báo cáo thuế.",
      cases: [
        {
          id: "cs_acc_1",
          title: "Tổng tiền hóa đơn lệch vài trăm đồng so với báo giá gốc",
          status: "resolved",
          chatLink: "",
          description: "Hóa đơn tạo từ đơn hàng có nhiều dòng cùng thuế 8% nhưng amount_total trên hóa đơn chênh 1-2 đồng so với amount_total trên sale.order, dù chưa sửa gì thủ công.",
          images: [],
          cause: "Company đang để chế độ tính thuế 'Round per Line' trong khi báo giá cũ được tạo lúc cấu hình còn là 'Round Globally' — đổi cấu hình giữa chừng khiến hai chứng từ tính làm tròn thuế theo hai cách khác nhau trên cùng tập số liệu.",
          resolution: "Thống nhất một chế độ làm tròn thuế duy nhất tại Settings ▸ Accounting ▸ Taxes ▸ Rounding Method cho toàn bộ company, không đổi giữa kỳ kế toán đang mở. Với chứng từ cũ bị lệch, chấp nhận sai số nhỏ hoặc tạo bút toán điều chỉnh làm tròn (rounding line)."
        }
      ]
    },
    {
      id: "f_acc_2",
      name: "Thanh toán & đối chiếu",
      desc: "Đăng ký thanh toán, khớp sao kê ngân hàng, đối chiếu công nợ (full/partial reconcile)",
      models: {
        cards: [
          {
            id: "mc_payment", name: "account.payment", color: "#7F77DD", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",         type: "Char",      desc: "Số phiếu thanh toán (auto)", req: true },
              { name: "payment_type", type: "Selection", desc: "inbound (thu) / outbound (chi)", req: true },
              { name: "partner_id",   type: "Many2one",  desc: "Khách hàng / NCC", relTo: "mc_partneracc2" },
              { name: "amount",       type: "Monetary",  desc: "Số tiền thanh toán", req: true },
              { name: "journal_id",   type: "Many2one",  desc: "Sổ nhật ký (Bank/Cash)", relTo: "mc_journal" },
              { name: "date",         type: "Date",      desc: "Ngày thanh toán" },
              { name: "state",        type: "Selection", desc: "draft / in_process / paid / reconciled" },
              { name: "move_id",      type: "Many2one",  desc: "Bút toán kế toán tương ứng", relTo: "mc_move2" }
            ]
          },
          {
            id: "mc_bankstmt", name: "account.bank.statement.line", color: "#0891B2", x: 460, y: 40, width: 320,
            fields: [
              { name: "date",          type: "Date",      desc: "Ngày giao dịch trên sao kê", req: true },
              { name: "payment_ref",   type: "Char",      desc: "Nội dung chuyển khoản" },
              { name: "amount",        type: "Monetary",  desc: "Số tiền trên sao kê", req: true },
              { name: "partner_id",    type: "Many2one",  desc: "Đối tác gợi ý (theo rule đối chiếu)" },
              { name: "journal_id",    type: "Many2one",  desc: "Sổ nhật ký ngân hàng", relTo: "mc_journal" },
              { name: "is_reconciled", type: "Boolean",   desc: "Đã đối chiếu xong hay chưa" }
            ]
          },
          {
            id: "mc_journal", name: "account.journal", color: "#D97706", x: 460, y: 320, width: 300,
            fields: [
              { name: "name",               type: "Char",     desc: "Tên sổ nhật ký (VCB VND, Tiền mặt…)", req: true },
              { name: "type",               type: "Selection", desc: "bank / cash / sale / purchase / general" },
              { name: "default_account_id", type: "Many2one",  desc: "TK trung gian mặc định" }
            ]
          },
          {
            id: "mc_move2", name: "account.move", color: "#374151", x: 40, y: 320, width: 320,
            fields: [
              { name: "name",           type: "Char",      desc: "Số hóa đơn liên quan" },
              { name: "amount_residual",type: "Monetary",  desc: "Số tiền còn lại chưa đối chiếu" },
              { name: "payment_state",  type: "Selection", desc: "not_paid / partial / paid / reversed / in_payment" }
            ]
          },
          {
            id: "mc_partneracc2", name: "res.partner", color: "#D85A30", x: 40, y: 480, width: 320,
            fields: [
              { name: "name", type: "Char", desc: "Tên khách hàng / NCC", req: true },
              { name: "vat",  type: "Char", desc: "Mã số thuế" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_acc_2",
          name: "Đăng ký thanh toán & đối chiếu ngân hàng",
          nodes: [
            { id: "pn1", type: "start",     label: "Khách chuyển khoản / Kế toán chi tiền",   x: 40,   y: 140 },
            { id: "pn2", type: "task",      label: "Register Payment trên hóa đơn",           x: 280,  y: 140 },
            { id: "pn3", type: "task",      label: "Sao kê ngân hàng về (Bank Statement Line)", x: 520, y: 140 },
            { id: "pn4", type: "user_task", label: "Kế toán đối chiếu (Bank Reconciliation)", x: 760,  y: 140 },
            { id: "pn5", type: "gateway",   label: "Khớp đủ số tiền hóa đơn?",                x: 1000, y: 140 },
            { id: "pn6", type: "task",      label: "Full reconcile — khóa cặp bút toán",      x: 1240, y: 40 },
            { id: "pn7", type: "task",      label: "Partial reconcile — giữ amount_residual", x: 1240, y: 240 },
            { id: "pn8", type: "end",       label: "payment_state = paid",                    x: 1480, y: 40 },
            { id: "pn9", type: "end",       label: "payment_state = partial",                 x: 1480, y: 240 }
          ],
          edges: [
            { id: "pe1", from: "pn1", to: "pn2", label: "" },
            { id: "pe2", from: "pn2", to: "pn3", label: "" },
            { id: "pe3", from: "pn3", to: "pn4", label: "" },
            { id: "pe4", from: "pn4", to: "pn5", label: "" },
            { id: "pe5", from: "pn5", to: "pn6", label: "Đủ" },
            { id: "pe6", from: "pn5", to: "pn7", label: "Thiếu/thừa" },
            { id: "pe7", from: "pn6", to: "pn8", label: "" },
            { id: "pe8", from: "pn7", to: "pn9", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_acc_4", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Ghi nhận tiền thu vào/chi ra qua <code>account.payment</code> và đối chiếu (reconcile) với hóa đơn gốc lẫn dòng sao kê ngân hàng thực tế, đảm bảo <code>amount_residual</code> của công nợ luôn phản ánh đúng số còn lại.</p><p>Bao gồm cả đối chiếu <b>thủ công</b> (kế toán match tay) và <b>tự động</b> (rule khớp theo số tiền + số hóa đơn trong nội dung chuyển khoản).</p>"
        },
        {
          id: "db_acc_5", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Trên hóa đơn đã post, bấm <b>Register Payment</b> → tạo <code>account.payment</code>, sinh bút toán trung gian (Outstanding Receipts/Payments)</li><li>Import hoặc đồng bộ <code>account.bank.statement.line</code> từ ngân hàng (file OFX/CSV hoặc bank sync)</li><li>Vào <b>Bank Reconciliation</b>, hệ thống gợi ý khớp dòng sao kê với payment/hóa đơn theo số tiền và nội dung chuyển khoản</li><li>Xác nhận match → <code>reconcile</code>: nếu khớp đúng số tiền thì Full reconcile, còn lệch thì Partial reconcile và giữ lại <code>amount_residual</code></li><li>Theo dõi <code>payment_state</code> trên hóa đơn để biết đã thu/chi đủ hay còn nợ</li></ol>"
        },
        {
          id: "db_acc_6", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Chỉ đối chiếu được các bút toán trên tài khoản có <code>reconcile = true</code> (thường là 131/331)</li><li>Thanh toán ngoại tệ đối chiếu với hóa đơn nội tệ (hoặc ngược lại) sẽ tự sinh thêm bút toán <mark style='background:#FEF08A'>chênh lệch tỷ giá</mark> (Exchange Gain/Loss) nếu tỷ giá ngày thanh toán khác ngày hóa đơn</li><li>Không cho phép reconcile 2 lần trên cùng một dòng bút toán — hệ thống tự ẩn dòng đã <code>is_reconciled = true</code> khỏi danh sách gợi ý</li><li>Partial reconcile vẫn giữ hóa đơn ở trạng thái <code>payment_state = partial</code>, không được tính là đã thu/chi đủ trong báo cáo công nợ</li></ul>"
        }
      ],
      integrations: [
        { id: "int_acc_4", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "in",
          content: "<p>Thanh toán thu tiền khách hàng luôn gắn với hóa đơn bán sinh từ <code>sale.order</code>, giảm dần <code>amount_residual</code> trên hóa đơn gốc.</p>" },
        { id: "int_acc_5", module: "purchase", icon: "ti-shopping-bag", color: "#D97706", direction: "in",
          content: "<p>Thanh toán chi cho nhà cung cấp gắn với vendor bill sinh từ <code>purchase.order</code>, hỗ trợ thanh toán gộp nhiều hóa đơn một lần (batch payment).</p>" },
        { id: "int_acc_6", module: "bank sync", icon: "ti-building-bank", color: "#0891B2", direction: "bidi",
          content: "<p>Đồng bộ 2 chiều với ngân hàng qua Online Bank Sync hoặc import file OFX/CSV để sinh <code>account.bank.statement.line</code>.</p><p>Kết quả đối chiếu ngược lại cập nhật <code>is_reconciled</code> và trạng thái sao kê.</p>" }
      ],
      notes: "Nên bật rule đối chiếu tự động theo mã hóa đơn trong nội dung chuyển khoản để giảm thao tác match tay hàng ngày.",
      cases: [
        {
          id: "cs_acc_2",
          title: "Thanh toán ngoại tệ tạo bút toán chênh lệch tỷ giá bất thường",
          status: "investigating",
          chatLink: "",
          description: "Khách thanh toán hóa đơn USD nhưng khi đối chiếu, hệ thống tự sinh thêm một bút toán 'Exchange Difference' với số tiền khá lớn dù tỷ giá ngày thanh toán chỉ nhích nhẹ so với ngày lập hóa đơn.",
          images: [],
          cause: "Tỷ giá dùng để hạch toán payment lấy theo bảng tỷ giá tự động cập nhật hàng ngày (rate provider) trong khi hóa đơn gốc dùng tỷ giá nhập tay tại thời điểm lập — chênh lệch tỷ giá giữa hai nguồn bị khuếch đại thêm do quy đổi qua VND ở bước trung gian.",
          resolution: "Đang rà lại cấu hình Settings ▸ Accounting ▸ Currencies: thống nhất một nguồn tỷ giá (rate provider) cho cả hóa đơn lẫn thanh toán, đồng thời kiểm tra lại tài khoản 'Exchange Gain/Loss' đã map đúng theo từng loại tiền tệ chưa."
        }
      ]
    }
  ]
});

export const CRM = {
  id: "mod_crm",
  name: "CRM",
  tech: "crm",
  color: "#D4537E",
  status: "studying",
  updatedAt: "2026-05-25",
  overview: {
    version: "18.0",
    category: "Quan hệ KH",
    depends: "base, mail, sales_team, utm, calendar",
    menu: "CRM ▸ Sales ▸ My Pipeline",
    purpose:
      "Quản lý toàn bộ vòng đời khách hàng tiềm năng từ Lead → Opportunity → Won/Lost. Hợp nhất model crm.lead cho cả 2 giai đoạn (type = lead/opportunity), pipeline dạng Kanban theo crm.stage, gán Sales Team/Sales Person tự động, và nhắc lịch hoạt động (mail.activity). Khi chốt deal (Won) có thể sinh thẳng báo giá bên module Sales."
  },
  mainFlows: [
    {
      id: "mf_crm_1",
      name: "Lead → Cơ hội → Chốt deal",
      nodes: [
        { id: "n1", type: "start",    label: "Lead mới vào hệ thống",              x: 60,   y: 160 },
        { id: "n2", type: "task",     label: "Gán Sales Team & Sales Person",       x: 280,  y: 160 },
        { id: "n3", type: "gateway",  label: "Đủ điều kiện?",                       x: 520,  y: 160 },
        { id: "n9", type: "end",      label: "Loại bỏ (Junk)",                      x: 520,  y: 320 },
        { id: "n4", type: "task",     label: "Convert → Opportunity",               x: 740,  y: 60  },
        { id: "n5", type: "task",     label: "Theo dõi Pipeline (Kanban)",          x: 960,  y: 60  },
        { id: "n6", type: "gateway",  label: "Chốt được?",                          x: 1180, y: 60  },
        { id: "n7", type: "end",      label: "Won — Tạo báo giá bên Sales",         x: 1400, y: 0   },
        { id: "n8", type: "end",      label: "Lost — Ghi lý do",                    x: 1400, y: 140  }
      ],
      edges: [
        { id: "e1", from: "n1", to: "n2", label: "" },
        { id: "e2", from: "n2", to: "n3", label: "" },
        { id: "e3", from: "n3", to: "n4", label: "Có" },
        { id: "e4", from: "n3", to: "n9", label: "Không" },
        { id: "e5", from: "n4", to: "n5", label: "" },
        { id: "e6", from: "n5", to: "n6", label: "" },
        { id: "e7", from: "n6", to: "n7", label: "Thắng" },
        { id: "e8", from: "n6", to: "n8", label: "Thua" }
      ]
    }
  ],
  features: [
    {
      id: "f_crm_1",
      name: "Thu thập & Phân loại Lead",
      desc: "Nhận lead từ nhiều nguồn, tự động gán Sales Team",
      models: {
        cards: [
          {
            id: "mc_crmlead", name: "crm.lead", color: "#D4537E", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",             type: "Char",      desc: "Tên cơ hội / Lead",     req: true },
              { name: "type",             type: "Selection", desc: "lead / opportunity",     req: true },
              { name: "partner_id",       type: "Many2one",  desc: "Khách hàng liên quan",   relTo: "mc_partner" },
              { name: "contact_name",     type: "Char",      desc: "Tên người liên hệ" },
              { name: "email_from",       type: "Char",      desc: "Email" },
              { name: "phone",            type: "Char",      desc: "Điện thoại" },
              { name: "source_id",        type: "Many2one",  desc: "Nguồn (utm.source)",     relTo: "mc_source" },
              { name: "team_id",          type: "Many2one",  desc: "Sales Team phụ trách",   req: true, relTo: "mc_team" },
              { name: "user_id",          type: "Many2one",  desc: "Sales Person" },
              { name: "stage_id",         type: "Many2one",  desc: "Giai đoạn pipeline" },
              { name: "probability",      type: "Float",     desc: "% xác suất chốt" },
              { name: "expected_revenue", type: "Monetary",  desc: "Doanh thu dự kiến" }
            ]
          },
          {
            id: "mc_team", name: "crm.team", color: "#378ADD", x: 440, y: 40, width: 300,
            fields: [
              { name: "name",       type: "Char",     desc: "Tên Sales Team",             req: true },
              { name: "member_ids", type: "Many2many",desc: "Thành viên trong team" },
              { name: "use_leads",  type: "Boolean",  desc: "Bật luồng Lead riêng (2 bước)" }
            ]
          },
          {
            id: "mc_source", name: "utm.source", color: "#F59E0B", x: 440, y: 260, width: 300,
            fields: [
              { name: "name", type: "Char", desc: "Nguồn: Website/Facebook Ads/Zalo/Referral…", req: true }
            ]
          },
          {
            id: "mc_partner", name: "res.partner", color: "#7C3AED", x: 40, y: 340, width: 300,
            fields: [
              { name: "name",  type: "Char", desc: "Tên khách hàng / công ty", req: true },
              { name: "email", type: "Char", desc: "Email" },
              { name: "phone", type: "Char", desc: "SĐT" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_crm_1",
          name: "Hợp nhất Lead từ nhiều nguồn",
          nodes: [
            { id: "fn1", type: "start_message", label: "Website Form",                  x: 40,  y: 20  },
            { id: "fn2", type: "start_message", label: "Email đến",                     x: 40,  y: 140 },
            { id: "fn3", type: "start",         label: "Nhập tay (Call/Sự kiện)",        x: 40,  y: 260 },
            { id: "fn4", type: "task",          label: "Tạo crm.lead (type = lead)",     x: 280, y: 140 },
            { id: "fn5", type: "gateway",       label: "Có rule Team?",                  x: 520, y: 140 },
            { id: "fn6", type: "task",          label: "Auto-assign theo Team rule",     x: 760, y: 40  },
            { id: "fn7", type: "user_task",     label: "Sales Manager gán thủ công",     x: 760, y: 240 },
            { id: "fn8", type: "end",           label: "Lead sẵn sàng trong Pipeline",   x: 1000,y: 140 }
          ],
          edges: [
            { id: "fe1", from: "fn1", to: "fn4", label: "" },
            { id: "fe2", from: "fn2", to: "fn4", label: "" },
            { id: "fe3", from: "fn3", to: "fn4", label: "" },
            { id: "fe4", from: "fn4", to: "fn5", label: "" },
            { id: "fe5", from: "fn5", to: "fn6", label: "Có" },
            { id: "fe6", from: "fn5", to: "fn7", label: "Không" },
            { id: "fe7", from: "fn6", to: "fn8", label: "" },
            { id: "fe8", from: "fn7", to: "fn8", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_c1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Gom mọi đầu mối khách hàng tiềm năng (website, email, gọi điện, sự kiện, quảng cáo) về một chỗ duy nhất — <code>crm.lead</code>.</p><p>Áp dụng cho cả mô hình <b>1 bước</b> (Lead = Opportunity luôn) và <b>2 bước</b> (bật <code>use_leads</code> trên Team để có hàng chờ duyệt Lead trước khi convert).</p>"
        },
        {
          id: "db_c2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Lead vào hệ thống (form web, alias email, hoặc tạo tay) — trạng thái <code>type = lead</code></li><li>Hệ thống match <b>Team rule</b> theo từ khoá/khu vực để auto-gán <code>team_id</code> + <code>user_id</code></li><li>Sales Person xem chi tiết, gọi xác nhận nhu cầu</li><li>Nếu đủ điều kiện → bấm <b>Convert to Opportunity</b> → sinh <code>stage_id</code> đầu tiên trong pipeline</li><li>Nếu không phù hợp → đánh dấu <b>Lost</b> ngay từ giai đoạn Lead (junk)</li></ol>"
        },
        {
          id: "db_c3", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Trùng lead (cùng email/SĐT trong 30 ngày) → hệ thống cảnh báo <mark style='background:#FEF08A'>duplicate lead</mark>, gợi ý merge</li><li><code>probability</code> mặc định lấy theo cấu hình % của <code>stage_id</code>, có thể override tay</li><li>Lead không có hoạt động (activity) quá 15 ngày sẽ bị gắn cờ <b>Lead nguội</b> trên Kanban</li></ul>"
        }
      ],
      integrations: [
        { id: "int_c1", module: "website", icon: "ti-world", color: "#0891B2", direction: "in",
          content: "<p>Form \"Liên hệ\" / \"Đăng ký demo\" trên website tạo thẳng <code>crm.lead</code> qua controller <code>website_crm</code>.</p><p>UTM (<code>source_id</code>, <code>medium_id</code>, <code>campaign_id</code>) được tự động gắn từ query string của landing page.</p>" },
        { id: "int_c2", module: "mail", icon: "ti-mail", color: "#2563EB", direction: "in",
          content: "<p>Email gửi tới alias catch-all (vd <code>sales@company.com</code>) được <code>mail.gateway</code> parse thành lead mới, đính kèm file làm attachment.</p>" },
        { id: "int_c3", module: "sales_team", icon: "ti-users", color: "#378ADD", direction: "bidi",
          content: "<p>Team rule (dựa trên khu vực / từ khoá / round-robin) quyết định <code>team_id</code> + <code>user_id</code> khi lead vào.</p><p>Ngược lại, số liệu lead/opportunity theo team hiển thị trên Team Dashboard.</p>" },
        { id: "int_c4", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "out",
          content: "<p>Khi Opportunity chuyển sang giai đoạn <code>is_won = true</code>, có thể bấm <b>New Quotation</b> để tạo thẳng <code>sale.order</code> với <code>partner_id</code> kế thừa từ Lead.</p>" }
      ],
      notes: "Cân nhắc thêm bước gọi API check trùng số điện thoại/email ngay tại form website, thay vì để hệ thống cảnh báo duplicate sau khi lead đã tạo.",
      cases: [
        {
          id: "cs_c1",
          title: "Lead từ website không tự gán Sales Team",
          status: "resolved",
          chatLink: "",
          description: "Lead tạo từ form website luôn rơi vào Team mặc định (\"Website\") thay vì đúng team khu vực, dù đã cấu hình Team Rule theo từ khoá.",
          images: [],
          cause: "Team Rule dùng field 'Assignment Domain' nhưng lead từ website không set sẵn trường được domain filter tới (vd. state_id), nên rule không khớp và rơi về default.",
          resolution: "Sửa Assignment Domain để không phụ thuộc field trống khi tạo từ web (thêm điều kiện OR chấp nhận rỗng), hoặc yêu cầu form web bắt buộc nhập Tỉnh/Thành trước khi submit."
        }
      ]
    },
    {
      id: "f_crm_2",
      name: "Quản lý Pipeline cơ hội (Kanban)",
      desc: "Theo dõi cơ hội theo từng giai đoạn, dự báo doanh thu",
      models: {
        cards: [
          {
            id: "mc_stage", name: "crm.stage", color: "#F59E0B", x: 40, y: 40, width: 300,
            fields: [
              { name: "name",     type: "Char",     desc: "Tên giai đoạn: New/Qualified/Proposition/Won", req: true },
              { name: "sequence", type: "Integer",  desc: "Thứ tự hiển thị trên Kanban" },
              { name: "is_won",   type: "Boolean",  desc: "Đánh dấu đây là giai đoạn Thắng" },
              { name: "team_id",  type: "Many2one", desc: "Giới hạn giai đoạn theo Team (nếu có)" }
            ]
          },
          {
            id: "mc_lead2", name: "crm.lead", color: "#D4537E", x: 400, y: 40, width: 320,
            fields: [
              { name: "stage_id",        type: "Many2one",  desc: "Giai đoạn hiện tại", relTo: "mc_stage" },
              { name: "probability",     type: "Float",     desc: "% xác suất chốt (auto theo stage)" },
              { name: "expected_revenue",type: "Monetary",  desc: "Doanh thu dự kiến" },
              { name: "date_deadline",   type: "Date",      desc: "Hạn chót dự kiến chốt" },
              { name: "kanban_state",    type: "Selection", desc: "normal / done / blocked" },
              { name: "lost_reason_id",  type: "Many2one",  desc: "Lý do Lost (bắt buộc nếu Lost)" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_crm_2",
          name: "Tự động hoá khi đổi giai đoạn",
          nodes: [
            { id: "gn1", type: "start",   label: "User kéo thẻ sang cột mới",              x: 40,  y: 140 },
            { id: "gn2", type: "task",    label: "Cập nhật stage_id + probability",         x: 280, y: 140 },
            { id: "gn3", type: "gateway", label: "Stage = Won?",                            x: 520, y: 140 },
            { id: "gn4", type: "task",    label: "Set probability=100%, khoá kéo tiếp",     x: 760, y: 40  },
            { id: "gn5", type: "task",    label: "Log hoạt động \"Đổi giai đoạn\"",         x: 760, y: 240 },
            { id: "gn6", type: "end",     label: "Pipeline cập nhật",                       x: 1000,y: 140 }
          ],
          edges: [
            { id: "ge1", from: "gn1", to: "gn2", label: "" },
            { id: "ge2", from: "gn2", to: "gn3", label: "" },
            { id: "ge3", from: "gn3", to: "gn4", label: "Có" },
            { id: "ge4", from: "gn3", to: "gn5", label: "Không" },
            { id: "ge5", from: "gn4", to: "gn6", label: "" },
            { id: "ge6", from: "gn5", to: "gn6", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_c4", icon: "ti-layout-kanban", title: "Cách vận hành Kanban",
          content: "<p>Mỗi cột là 1 <code>crm.stage</code>. Kéo-thả thẻ giữa các cột sẽ cập nhật <code>stage_id</code> và tự tính lại <code>probability</code> theo % cấu hình của stage đích.</p><p>Cột cuối (<code>is_won = true</code>) khi thả thẻ vào sẽ tự set <code>probability = 100</code> và khoá không cho kéo tiếp.</p>"
        },
        {
          id: "db_c5", icon: "ti-chart-bar", title: "Dự báo doanh thu (Forecast)",
          content: "<p>Doanh thu dự báo theo tháng = <code>Σ expected_revenue × probability%</code> của các opportunity đang mở, nhóm theo <code>date_deadline</code>.</p><p>Có thể lọc theo Team hoặc Sales Person để xem forecast riêng từng người.</p>"
        }
      ],
      integrations: [
        { id: "int_c5", module: "calendar", icon: "ti-calendar", color: "#EC4899", direction: "bidi",
          content: "<p>Mỗi lần lên lịch hẹn/demo với khách trên Opportunity sẽ tạo <code>calendar.event</code> liên kết ngược qua <code>opportunity_id</code>.</p>" }
      ],
      notes: "Cân nhắc thêm rule tự động 'nhắc gọi lại' nếu Opportunity nằm yên 1 chỗ quá 10 ngày không đổi stage.",
      cases: [
        {
          id: "cs_c2",
          title: "Kéo thẻ qua Won nhưng probability không tự về 100%",
          status: "resolved",
          chatLink: "",
          description: "Sales kéo Opportunity vào cột 'Won' nhưng % xác suất vẫn giữ nguyên giá trị cũ (vd 70%) thay vì tự nhảy lên 100%, gây sai lệch báo cáo forecast.",
          images: [],
          cause: "Cột Won được tạo thủ công nhưng quên tick is_won = true trên crm.stage, nên hệ thống không nhận diện đây là giai đoạn thắng.",
          resolution: "Vào Settings ▸ Sales ▸ CRM ▸ Stages, mở stage 'Won', tick 'Is Won Stage'. Chạy lại action 'Recompute probability' cho các opportunity cũ nếu cần."
        }
      ]
    },
    {
      id: "f_crm_3",
      name: "Lịch hoạt động & Nhắc nhở",
      desc: "Đặt lịch gọi/email/họp, cảnh báo quá hạn",
      models: {
        cards: [
          {
            id: "mc_activity", name: "mail.activity", color: "#9CA3AF", x: 40, y: 40, width: 300,
            fields: [
              { name: "activity_type_id", type: "Many2one", desc: "Loại: Gọi điện/Email/Họp/Việc cần làm", req: true },
              { name: "summary",          type: "Char",     desc: "Tóm tắt việc cần làm" },
              { name: "date_deadline",    type: "Date",     desc: "Hạn hoàn thành", req: true },
              { name: "user_id",          type: "Many2one", desc: "Người phụ trách" },
              { name: "res_id",           type: "Integer",  desc: "ID bản ghi crm.lead liên quan" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_crm_3",
          name: "Vòng đời một hoạt động (Activity)",
          nodes: [
            { id: "an1", type: "start",   label: "Sales lên lịch hoạt động",                x: 40,  y: 140 },
            { id: "an2", type: "task",    label: "Tạo mail.activity (gọi/họp/email)",       x: 280, y: 140 },
            { id: "an3", type: "gateway", label: "Tới hạn mà chưa xong?",                   x: 520, y: 140 },
            { id: "an4", type: "task",    label: "Đánh dấu quá hạn — chấm đỏ Kanban",       x: 760, y: 40  },
            { id: "an5", type: "task",    label: "Đánh dấu hoàn thành",                     x: 760, y: 240 },
            { id: "an6", type: "end",     label: "Kết thúc hoạt động",                      x: 1000,y: 140 }
          ],
          edges: [
            { id: "ae1", from: "an1", to: "an2", label: "" },
            { id: "ae2", from: "an2", to: "an3", label: "" },
            { id: "ae3", from: "an3", to: "an4", label: "Quá hạn" },
            { id: "ae4", from: "an3", to: "an5", label: "Xong đúng hạn" },
            { id: "ae5", from: "an4", to: "an6", label: "" },
            { id: "ae6", from: "an5", to: "an6", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_c6", icon: "ti-bell", title: "Nhắc nhở & cảnh báo trễ hạn",
          content: "<p>Lead/Opportunity quá hạn hoạt động (activity <code>date_deadline</code> < hôm nay) sẽ hiện chấm đỏ trên thẻ Kanban và trong mục <b>Hoạt động của tôi</b>.</p>"
        },
        {
          id: "db_c7", icon: "ti-list-numbers", title: "Loại hoạt động thường dùng",
          content: "<ul><li><b>Gọi điện</b> — mặc định hẹn lại trong ngày</li><li><b>Email</b> — auto tạo khi gửi báo giá</li><li><b>Họp / Demo</b> — đồng bộ 2 chiều với Calendar</li><li><b>Việc cần làm</b> — nhắc việc nội bộ, không gắn khách hàng</li></ul>"
        }
      ],
      integrations: [
        { id: "int_c6", module: "calendar", icon: "ti-calendar", color: "#EC4899", direction: "out",
          content: "<p>Hoạt động loại 'Họp' đồng bộ 2 chiều với <code>calendar.event</code> — đổi giờ trên Calendar sẽ cập nhật ngược lại <code>date_deadline</code> của activity.</p>" }
      ],
      notes: "Cân nhắc bật email nhắc nhở hằng ngày (digest) cho Sales Person có activity quá hạn — hiện chỉ hiện trên UI, chưa có email tự động.",
      cases: [
        {
          id: "cs_c3",
          title: "Không nhận được nhắc nhở khi hoạt động quá hạn",
          status: "investigating",
          chatLink: "",
          description: "Sales Person phản ánh không thấy nhắc nhở nào (email/thông báo) khi activity quá hạn, chỉ tình cờ thấy chấm đỏ trên Kanban khi mở app lên.",
          images: [],
          cause: "Hệ thống hiện chỉ hiển thị cảnh báo trên UI (badge đỏ), chưa bật digest email nhắc việc quá hạn hằng ngày.",
          resolution: "Đang đề xuất bật Scheduled Action 'Mail Activity: Reminder' + cấu hình mail template nhắc việc quá hạn (xem thêm phần Ghi chú)."
        }
      ]
    },
    {
      id: "f_crm_4",
      name: "Chốt deal & Chuyển thành đơn hàng",
      desc: "Won → tạo báo giá bên Sales, đóng Opportunity",
      models: {
        cards: [
          {
            id: "mc_wonlead", name: "crm.lead", color: "#D4537E", x: 40, y: 40, width: 300,
            fields: [
              { name: "name",             type: "Char",     desc: "Tên cơ hội",             req: true },
              { name: "partner_id",       type: "Many2one", desc: "Khách hàng",              req: true, relTo: "mc_partner3" },
              { name: "expected_revenue", type: "Monetary", desc: "Giá trị dự kiến" },
              { name: "date_closed",      type: "Datetime", desc: "Ngày chốt thực tế" },
              { name: "stage_id",         type: "Many2one", desc: "Giai đoạn (đã đạt Won)" },
              { name: "team_id",          type: "Many2one", desc: "Sales Team" }
            ]
          },
          {
            id: "mc_so2", name: "sale.order", color: "#5BAA50", x: 400, y: 40, width: 300,
            fields: [
              { name: "name",           type: "Char",     desc: "Mã báo giá (SO)",  req: true },
              { name: "partner_id",     type: "Many2one", desc: "Khách hàng",       req: true, relTo: "mc_partner3" },
              { name: "opportunity_id", type: "Many2one", desc: "Cơ hội gốc",       relTo: "mc_wonlead" },
              { name: "amount_total",   type: "Monetary", desc: "Tổng tiền" },
              { name: "state",          type: "Selection",desc: "draft / sent / sale" }
            ]
          },
          {
            id: "mc_partner3", name: "res.partner", color: "#7C3AED", x: 40, y: 300, width: 300,
            fields: [
              { name: "name",  type: "Char", desc: "Tên khách hàng", req: true },
              { name: "email", type: "Char", desc: "Email" },
              { name: "phone", type: "Char", desc: "SĐT" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_crm_4",
          name: "Won → Tạo báo giá bên Sales",
          nodes: [
            { id: "wn1", type: "start",   label: "Opportunity vào stage Won",                 x: 40,  y: 140 },
            { id: "wn2", type: "task",    label: "Set probability=100%, date_closed=hôm nay", x: 280, y: 140 },
            { id: "wn3", type: "gateway", label: "Đã có Quotation chưa?",                     x: 520, y: 140 },
            { id: "wn4", type: "task",    label: "Bấm 'New Quotation' → tạo sale.order",      x: 760, y: 40  },
            { id: "wn5", type: "task",    label: "Mở Quotation có sẵn",                       x: 760, y: 240 },
            { id: "wn6", type: "end",     label: "Chuyển sang quy trình Sales",                x: 1000,y: 140 }
          ],
          edges: [
            { id: "we1", from: "wn1", to: "wn2", label: "" },
            { id: "we2", from: "wn2", to: "wn3", label: "" },
            { id: "we3", from: "wn3", to: "wn4", label: "Chưa" },
            { id: "we4", from: "wn3", to: "wn5", label: "Rồi" },
            { id: "we5", from: "wn4", to: "wn6", label: "" },
            { id: "we6", from: "wn5", to: "wn6", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_c8", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Đây là điểm bàn giao giữa <b>CRM</b> và <b>Sales</b>: khi Opportunity được xác nhận Thắng, Sales Person cần một thao tác duy nhất để chuyển nhu cầu khách hàng thành báo giá chính thức, không phải nhập lại thông tin từ đầu.</p>"
        },
        {
          id: "db_c9", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Kéo/chuyển Opportunity vào stage có <code>is_won = true</code></li><li>Hệ thống tự set <code>probability = 100</code> và <code>date_closed</code> = thời điểm hiện tại</li><li>Trên form Opportunity, bấm nút <b>New Quotation</b></li><li>Odoo tạo <code>sale.order</code> mới, kế thừa <code>partner_id</code> và ghi <code>opportunity_id</code> để truy vết ngược</li><li>Sales Person điền sản phẩm/số lượng rồi tiếp tục quy trình báo giá như bình thường bên module <b>Sales</b></li></ol>"
        },
        {
          id: "db_c10", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Không cho set stage Won nếu <code>expected_revenue = 0</code> — bắt buộc nhập giá trị deal trước khi chốt</li><li>Một Opportunity chỉ nên có <mark style='background:#FEF08A'>1 Quotation gốc</mark> liên kết qua <code>opportunity_id</code> để báo cáo doanh thu không bị đếm trùng</li><li>Opportunity Won vẫn giữ nguyên trong Pipeline (không xoá) để phục vụ báo cáo lịch sử chuyển đổi (conversion rate)</li></ul>"
        }
      ],
      integrations: [
        { id: "int_c7", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "out",
          content: "<p>Tạo <code>sale.order</code> mới với <code>partner_id</code> kế thừa từ Opportunity, <code>order_line</code> để trống chờ Sales Person điền sản phẩm.</p><p><code>opportunity_id</code> được lưu lại trên đơn hàng để truy vết Opportunity gốc.</p>" },
        { id: "int_c8", module: "mail", icon: "ti-mail", color: "#2563EB", direction: "out",
          content: "<p>Khi Opportunity chuyển Won, hệ thống tự log message trên chatter + thông báo cho Sales Manager của Team theo dõi.</p>" }
      ],
      notes: "Khi khách hàng có nhiều Opportunity song song (upsell/cross-sell), cân nhắc tạo Quotation riêng cho từng Opportunity thay vì gộp chung 1 đơn.",
      cases: [
        {
          id: "cs_c4",
          title: "Tạo trùng nhiều báo giá cho 1 Opportunity",
          status: "open",
          chatLink: "",
          description: "Sales bấm nhầm nút 'New Quotation' 2 lần trên cùng 1 Opportunity đã Won, hệ thống tạo ra 2 sale.order riêng biệt cùng trỏ về 1 opportunity_id, gây khó theo dõi báo cáo doanh thu.",
          images: [],
          cause: "Nút 'New Quotation' hiện không kiểm tra đã tồn tại quotation liên kết hay chưa trước khi tạo mới.",
          resolution: "Đang đề xuất thêm gateway kiểm tra (xem Luồng xử lý) — nếu opportunity_id đã có sale.order thì đổi nút thành 'View Quotation' thay vì tạo mới."
        }
      ]
    }
  ],
  changelog: [
    { id: "cl_crm6", date: "2026-05-25", version: "0.6", type: "feature",     status: "approved", author: "Lan Anh", featureId: "f_crm_4", title: "Vẽ luồng Won → Tạo báo giá & case trùng quotation",      desc: "Bổ sung đầy đủ model (crm.lead/sale.order), luồng xử lý và case khách hàng cho bước chuyển giao từ CRM sang Sales khi chốt deal." },
    { id: "cl_crm5", date: "2026-05-23", version: "0.5", type: "feature",     status: "approved", author: "Lan Anh", featureId: "f_crm_3", title: "Thêm luồng vòng đời hoạt động (Activity)",                 desc: "Vẽ sơ đồ tạo → theo dõi → quá hạn/hoàn thành cho mail.activity, bổ sung case về digest email nhắc việc." },
    { id: "cl_crm4", date: "2026-05-22", version: "0.4", type: "improvement", status: "approved", author: "Lan Anh", featureId: "f_crm_2", title: "Tự động hoá cập nhật probability theo stage",              desc: "Thêm sơ đồ luồng đổi giai đoạn Kanban + case xử lý lỗi probability không tự về 100% khi Won." },
    { id: "cl_crm1", date: "2026-05-20", version: "0.3", type: "feature",     status: "approved", author: "Lan Anh", featureId: "f_crm_1", title: "Thêm luồng phân loại & gán Sales Team tự động",            desc: "Bổ sung gateway kiểm tra điều kiện đủ tiêu chuẩn trước khi convert Lead → Opportunity, kèm sơ đồ hợp nhất lead từ nhiều nguồn." },
    { id: "cl_crm2", date: "2026-05-14", version: "0.2", type: "improvement",status: "approved", author: "Lan Anh", featureId: "f_crm_2", title: "Chuẩn hoá field lost_reason_id",                            desc: "Bắt buộc chọn lý do khi đánh dấu Lost để phục vụ báo cáo lý do mất khách." },
    { id: "cl_crm3", date: "2026-05-08", version: "0.1", type: "feature",     status: "approved", author: "Lan Anh", featureId: "",         title: "Khởi tạo module CRM",                                    desc: "Research sơ bộ menu, model chính (crm.lead, crm.stage, crm.team) và vẽ luồng chính Lead → Won." }
  ]
};

export const AFFILIATE = {
  id: "mod_affiliate",
  name: "Affiliate",
  tech: "affiliate",
  color: "#0D9488",
  status: "studying",
  updatedAt: "2026-08-29",
  overview: {
    version: "18.0",
    category: "Affiliate / KOL-KOC",
    depends: "stock (Kho hàng), sale + website_sale (Bán hàng/E-commerce), account (Hoá đơn)",
    menu: "Affiliate ▸ Creators ▸ Campaigns",
    purpose:
      "Quản lý kênh bán hàng qua cộng tác viên và đối tác giới thiệu: chương trình Affiliate, chính sách hoa hồng, cấp mã giới thiệu, theo dõi đơn và chi trả hoa hồng. Hệ thống Quản lý Tập trung Affiliate & Booking KOL/KOC giúp tự động hoá và đo lường toàn bộ hoạt động hợp tác với nhà sáng tạo nội dung (KOL/KOC) và cộng tác viên (CTV) — từ liên hệ, gửi quà mẫu, duyệt kịch bản đến đối soát doanh số và tính hoa hồng. Khác với sàn Affiliate thương mại, hệ thống này không yêu cầu KOL/CTV đăng nhập — mọi nghiệp vụ do đội ngũ nội bộ thực hiện, dữ liệu tập trung một chỗ thay vì phân mảnh trên Excel."
  },
  mainFlows: [
    {
      id: "mf_aff_1",
      name: "Quy trình vận hành Affiliate & Booking KOL/KOC",
      nodes: [
        { id: "n1",  type: "start",    label: "1. Nhập hồ sơ Creator & tạo chiến dịch",     x: 40,   y: 160 },
        { id: "n2",  type: "task",     label: "2. Lệnh xuất kho quà mẫu",                    x: 280,  y: 160 },
        { id: "n3",  type: "task",     label: "3. Nhận quà mẫu & sản xuất nội dung",         x: 520,  y: 160 },
        { id: "n4",  type: "task",     label: "4. Duyệt kịch bản & video demo",              x: 760,  y: 160 },
        { id: "n5",  type: "gateway",  label: "Khách đặt qua link/mã giới thiệu?",           x: 1000, y: 160 },
        { id: "n5b", type: "task",     label: "Gán thủ công mã Creator trên đơn",            x: 1000, y: 320 },
        { id: "n6",  type: "task",     label: "6. Tính hoa hồng & báo cáo ROI",              x: 1240, y: 160 },
        { id: "n7",  type: "task",     label: "7. Duyệt chi & chuyển khoản",                 x: 1480, y: 160 },
        { id: "n8",  type: "task",     label: "8. Cập nhật đã thanh toán",                   x: 1720, y: 160 },
        { id: "n9",  type: "end",      label: "9. Creator nhận thanh toán",                  x: 1960, y: 160 }
      ],
      edges: [
        { id: "e1",  from: "n1",  to: "n2",  label: "" },
        { id: "e2",  from: "n2",  to: "n3",  label: "" },
        { id: "e3",  from: "n3",  to: "n4",  label: "" },
        { id: "e4",  from: "n4",  to: "n5",  label: "" },
        { id: "e5",  from: "n5",  to: "n6",  label: "Có — tự bắt đơn" },
        { id: "e6",  from: "n5",  to: "n5b", label: "Không" },
        { id: "e7",  from: "n5b", to: "n6",  label: "" },
        { id: "e8",  from: "n6",  to: "n7",  label: "" },
        { id: "e9",  from: "n7",  to: "n8",  label: "" },
        { id: "e10", from: "n8",  to: "n9",  label: "" }
      ]
    }
  ],
  features: [
    {
      id: "f_aff_1",
      name: "Quản lý hồ sơ Creator (KOL/KOC CRM)",
      desc: "Hồ sơ liên hệ, kênh social, báo giá theo Video/Livestream/Post",
      models: {
        cards: [
          {
            id: "mc_creator", name: "affiliate.creator", color: "#0D9488", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",          type: "Char",     desc: "Tên Creator / KOL / CTV", req: true },
              { name: "channel_ids",   type: "One2many", desc: "Kênh social (TikTok/FB/IG/YouTube)", relTo: "mc_channel" },
              { name: "rate_ids",      type: "One2many", desc: "Báo giá theo Video/Livestream/Post",  relTo: "mc_rate" },
              { name: "audience_note", type: "Text",      desc: "Ghi chú tệp khán giả" },
              { name: "history_note",  type: "Text",      desc: "Lịch sử hiệu suất hợp tác" }
            ]
          },
          {
            id: "mc_channel", name: "affiliate.creator.channel", color: "#378ADD", x: 440, y: 40, width: 300,
            fields: [
              { name: "platform",       type: "Selection", desc: "TikTok / Facebook / Instagram / YouTube", req: true },
              { name: "handle",         type: "Char",       desc: "Tên kênh / link" },
              { name: "creator_id",     type: "Many2one",   desc: "Creator sở hữu kênh", relTo: "mc_creator" },
              { name: "external_id",    type: "Char",       desc: "ID định danh Creator trên nền tảng (TikTok/Shopee)" },
              { name: "follower_count", type: "Integer",    desc: "Số follower — đồng bộ từ API" },
              { name: "last_synced_at", type: "Datetime",   desc: "Lần đồng bộ API gần nhất" }
            ]
          },
          {
            id: "mc_rate", name: "affiliate.creator.rate", color: "#D97706", x: 440, y: 240, width: 300,
            fields: [
              { name: "content_type", type: "Selection", desc: "Video / Livestream / Post", req: true },
              { name: "price",        type: "Monetary",  desc: "Giá booking" },
              { name: "creator_id",   type: "Many2one",  desc: "Creator áp dụng", relTo: "mc_creator" }
            ]
          }
        ]
      },
      flows: [],
      detailBlocks: [
        {
          id: "db_aff_1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Lưu trữ thông tin liên hệ, kênh social (TikTok, Facebook, Instagram, YouTube), tệp khán giả và lịch sử hiệu suất hợp tác. Quản lý báo giá chi tiết theo từng hình thức: <b>Video</b>, <b>Livestream</b>, <b>Post</b>.</p>"
        },
        {
          id: "db_aff_2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Marketing khai báo hồ sơ Creator (thông tin liên hệ, kênh social, tệp khán giả)</li><li>Nhập báo giá booking theo từng hình thức nội dung</li><li>Tạo chiến dịch hợp tác gắn với Creator đã khai báo</li></ol>"
        }
      ],
      integrations: [],
      notes: "",
      cases: []
    },
    {
      id: "f_aff_2",
      name: "Quản lý Booking & quà mẫu (Seeding)",
      desc: "Xuất kho quà mẫu, theo dõi sản xuất nội dung",
      models: { cards: [] },
      flows: [],
      detailBlocks: [
        {
          id: "db_aff_3", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Móc nối dữ liệu kho để khởi tạo đơn xuất kho gửi quà trải nghiệm; theo dõi trạng thái giao quà và tiến độ sản xuất nội dung (gửi brief, duyệt kịch bản, duyệt video demo, lịch đăng bài).</p>"
        },
        {
          id: "db_aff_4", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li><b>Lệnh xuất kho quà mẫu</b> — tạo đơn xuất kho gửi quà trải nghiệm, gắn trực tiếp mã chiến dịch để truy vết chi phí</li><li><b>Nhận quà mẫu & sản xuất nội dung</b> — Creator nhận quà, sản xuất nội dung theo brief đã gửi</li><li><b>Duyệt kịch bản & video demo</b> — Marketing duyệt kịch bản, video demo và chốt lịch đăng bài</li></ol>"
        }
      ],
      integrations: [
        { id: "int_aff_1", module: "stock", icon: "ti-truck", color: "#D97706", direction: "out",
          content: "<p>Quà mẫu seeding được lấy tồn và xuất kho từ <code>Kho hàng</code>, gắn trực tiếp mã chiến dịch của Creator để tránh thất thoát và truy vết chi phí.</p>" }
      ],
      notes: "",
      cases: []
    },
    {
      id: "f_aff_3",
      name: "Tự động hoá tracking & ghi nhận đơn hàng",
      desc: "Sinh mã giới thiệu, tự bắt đơn và gán doanh thu cho Creator",
      models: {
        cards: [
          {
            id: "mc_track", name: "affiliate.tracking.link", color: "#0D9488", x: 40, y: 40, width: 320,
            fields: [
              { name: "code",       type: "Char",      desc: "Mã giảm giá / voucher tự sinh", req: true },
              { name: "link",       type: "Char",      desc: "Link giới thiệu định danh Creator" },
              { name: "creator_id", type: "Many2one",  desc: "Creator liên kết", req: true },
              { name: "order_id",   type: "Many2one",  desc: "Đơn hàng ghi nhận", relTo: "mc_order" }
            ]
          },
          {
            id: "mc_order", name: "sale.order / website order", color: "#5BAA50", x: 440, y: 40, width: 300,
            fields: [
              { name: "name",         type: "Char",      desc: "Mã đơn hàng", req: true },
              { name: "amount_total", type: "Monetary",  desc: "Giá trị đơn" },
              { name: "creator_id",   type: "Many2one",  desc: "Creator được gán doanh thu" },
              { name: "state",        type: "Selection", desc: "Tự bắt đơn / gán thủ công" }
            ]
          }
        ]
      },
      flows: [],
      detailBlocks: [
        {
          id: "db_aff_5", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Tự động sinh mã giảm giá (voucher) và link giới thiệu định danh riêng từng Creator; tự động bắt đơn hàng thành công trên hệ thống bán hàng và gán doanh thu cho Creator tương ứng.</p>"
        },
        {
          id: "db_aff_6", icon: "ti-gavel", title: "Quy tắc nghiệp vụ — điểm dễ sai nhất",
          content: "<p>Bước <b>khách đặt hàng qua link/mã</b> là điểm dễ sai nhất trong toàn quy trình: nếu khách đặt hàng <mark style='background:#FEF08A'>không qua link/mã giới thiệu</mark>, đơn sẽ không được gắn nguồn.</p><p>Khi đó vận hành phải <b>gán mã Creator thủ công</b> trên đơn trước khi đơn đạt trạng thái ghi nhận hoa hồng.</p>"
        }
      ],
      integrations: [
        { id: "int_aff_2", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "in",
          content: "<p>Hệ thống tự động bắt đơn hàng thành công từ <code>Bán hàng / E-commerce</code> khi khách đặt qua link/mã giới thiệu, rồi gán doanh thu cho Creator tương ứng.</p>" }
      ],
      notes: "",
      cases: []
    },
    {
      id: "f_aff_4",
      name: "Báo cáo ROI & hiệu quả chiến dịch",
      desc: "Tính hiệu quả đầu tư trên tổng chi phí thực tế",
      models: { cards: [] },
      flows: [],
      detailBlocks: [
        {
          id: "db_aff_7", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Tính hiệu quả đầu tư trên tổng chi phí thực tế: <b>Phí booking + Giá trị quà mẫu + Hoa hồng affiliate</b>; đánh giá Creator nào mang lại GMV tốt nhất để tối ưu ngân sách kỳ sau.</p>"
        },
        {
          id: "db_aff_8", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<p>Hệ thống tính hoa hồng theo chính sách đã cấu hình và tổng hợp ROI trên tổng chi phí thực tế của từng Creator / chiến dịch.</p>"
        }
      ],
      integrations: [],
      notes: "",
      cases: []
    },
    {
      id: "f_aff_5",
      name: "Đối soát & thanh toán",
      desc: "Xuất bảng kê đối soát, duyệt chi và lưu lịch sử quyết toán",
      models: { cards: [] },
      flows: [],
      detailBlocks: [
        {
          id: "db_aff_9", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Tự động xuất bảng kê đối soát (doanh số, hoa hồng, phí booking); hỗ trợ kế toán duyệt chi, chuyển khoản và lưu trữ lịch sử quyết toán.</p>"
        },
        {
          id: "db_aff_10", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li><b>Duyệt chi & chuyển khoản</b> — Kế toán đối soát bảng kê, duyệt chi và chuyển khoản phí booking + hoa hồng</li><li><b>Cập nhật đã thanh toán</b> — hệ thống chuyển trạng thái Đã chi trả và lưu lịch sử quyết toán</li><li><b>Creator nhận thanh toán</b> — Creator nhận tiền kèm file đối soát do doanh nghiệp gửi ra, không cần truy cập hệ thống</li></ol>"
        }
      ],
      integrations: [
        { id: "int_aff_3", module: "account", icon: "ti-calculator", color: "#2563EB", direction: "out",
          content: "<p>Quyết toán hoa hồng & phí booking được đẩy sang <code>Hoá đơn</code> để hạch toán, sau khi kế toán duyệt chi và chuyển khoản.</p>" }
      ],
      notes: "",
      cases: []
    },
    {
      id: "f_aff_6",
      name: "Phân quyền & Vận hành",
      desc: "3 nhóm quyền, gán nhân sự booking theo gian hàng",
      models: { cards: [] },
      flows: [],
      detailBlocks: [
        {
          id: "db_aff_11", icon: "ti-shield-lock", title: "Phân quyền theo 3 nhóm",
          content: "<p>Thiết lập tại <code>Thiết lập › Người dùng & Công ty › Người dùng</code>.</p><ul><li><b>Nhân viên</b> — xem và thao tác trên dữ liệu mình phụ trách: chương trình, deal booking, Creator được gán; không truy cập cấu hình.</li><li><b>Quản lý</b> — xem và xử lý toàn bộ dữ liệu của phòng ban: phê duyệt, gán nhân sự booking, đối soát và xác nhận hoa hồng.</li><li><b>Quản trị</b> — toàn quyền: cấu hình module (App Affiliate, chính sách hoa hồng, KPI…), quản lý mọi dữ liệu và xem toàn bộ báo cáo.</li></ul>"
        },
        {
          id: "db_aff_12", icon: "ti-route", title: "Gán nhân sự booking vào gian hàng",
          content: "<p>Ngoài nhóm quyền, phải gán nhân sự booking vào gian hàng. Đường dẫn thao tác: <code>Shop › mở gian hàng › Thông tin quản trị › trường Nhân sự booking</code>.</p><p>Thêm nhân viên phụ trách vào trường Nhân sự booking của từng gian hàng. Nếu không được gán, nhân viên dù có nhóm quyền vẫn <b>không xem được</b>: chiến dịch gắn với gian hàng, KOL/Creator và chương trình cộng tác của shop đó.</p>"
        },
        {
          id: "db_aff_13", icon: "ti-gavel", title: "Nguyên tắc tách quyền",
          content: "<p>Người <b>thiết lập chính sách hoa hồng</b> và người <b>chi trả hoa hồng</b> nên là hai nhóm quyền khác nhau để đảm bảo kiểm soát nội bộ.</p>"
        }
      ],
      integrations: [],
      notes: "",
      cases: []
    },
    {
      id: "f_aff_7",
      name: "Đồng bộ Creator qua Shopee & TikTok API",
      desc: "Tự động lấy hồ sơ, chỉ số Creator từ Shopee Affiliate Open API và TikTok Creator Marketplace API",
      models: {
        cards: [
          {
            id: "mc_channel_sync", name: "affiliate.creator.channel", color: "#378ADD", x: 40, y: 40, width: 320,
            fields: [
              { name: "platform",       type: "Selection", desc: "tiktok / shopee", req: true },
              { name: "external_id",    type: "Char",      desc: "Creator ID / Open ID trên nền tảng", req: true },
              { name: "follower_count", type: "Integer",   desc: "Số follower (đồng bộ)" },
              { name: "engagement_rate",type: "Float",     desc: "Tỷ lệ tương tác % (đồng bộ)" },
              { name: "sync_status",    type: "Selection", desc: "ok / error / chưa đồng bộ" },
              { name: "last_synced_at", type: "Datetime",  desc: "Lần đồng bộ gần nhất" }
            ]
          },
          {
            id: "mc_synclog", name: "affiliate.api.sync.log", color: "#0D9488", x: 440, y: 40, width: 300,
            fields: [
              { name: "platform",     type: "Selection", desc: "tiktok / shopee", req: true },
              { name: "run_at",       type: "Datetime",  desc: "Thời điểm chạy đồng bộ", req: true },
              { name: "channel_id",   type: "Many2one",  desc: "Kênh được đồng bộ", relTo: "mc_channel_sync" },
              { name: "result",       type: "Selection", desc: "success / failed / rate_limited" },
              { name: "error_note",   type: "Text",      desc: "Chi tiết lỗi (nếu có)" }
            ]
          },
          {
            id: "mc_apicred", name: "affiliate.api.credential", color: "#7C3AED", x: 40, y: 300, width: 320,
            fields: [
              { name: "platform",       type: "Selection", desc: "tiktok / shopee", req: true },
              { name: "app_key",        type: "Char",      desc: "App Key / Client ID" },
              { name: "access_token",   type: "Char",      desc: "Access token (mã hoá khi lưu)" },
              { name: "refresh_token",  type: "Char",      desc: "Refresh token — dùng khi access token hết hạn" },
              { name: "expires_at",     type: "Datetime",  desc: "Thời điểm access token hết hạn" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_aff_sync",
          name: "Đồng bộ hồ sơ Creator qua Shopee/TikTok API",
          nodes: [
            { id: "sn1", type: "start",     label: "Cron 24h hoặc bấm \"Đồng bộ ngay\"",                x: 40,   y: 160 },
            { id: "sn2", type: "gateway",   label: "Token còn hạn?",                                    x: 280,  y: 160 },
            { id: "sn3", type: "task",      label: "Refresh access token qua refresh_token",            x: 280,  y: 320 },
            { id: "sn4", type: "gateway",   label: "Nguồn kênh?",                                       x: 520,  y: 160 },
            { id: "sn5", type: "task",      label: "Gọi TikTok Creator Marketplace API — lấy hồ sơ + follower + engagement", x: 760, y: 60 },
            { id: "sn6", type: "task",      label: "Gọi Shopee Affiliate Open API — lấy hồ sơ + hoa hồng đã ghi nhận",       x: 760, y: 260 },
            { id: "sn7", type: "gateway",   label: "Đã có channel khớp external_id?",                   x: 1000, y: 160 },
            { id: "sn8", type: "task",      label: "Cập nhật affiliate.creator.channel hiện có",        x: 1240, y: 60  },
            { id: "sn9", type: "task",      label: "Tạo mới affiliate.creator + channel",               x: 1240, y: 260 },
            { id: "sn10",type: "task",      label: "Ghi affiliate.api.sync.log (kết quả/lỗi)",          x: 1480, y: 160 },
            { id: "sn11",type: "end",       label: "Dữ liệu Creator cập nhật mới nhất",                 x: 1720, y: 160 }
          ],
          edges: [
            { id: "se1",  from: "sn1",  to: "sn2",  label: "" },
            { id: "se2",  from: "sn2",  to: "sn3",  label: "Hết hạn" },
            { id: "se3",  from: "sn2",  to: "sn4",  label: "Còn hạn" },
            { id: "se4",  from: "sn3",  to: "sn4",  label: "" },
            { id: "se5",  from: "sn4",  to: "sn5",  label: "TikTok" },
            { id: "se6",  from: "sn4",  to: "sn6",  label: "Shopee" },
            { id: "se7",  from: "sn5",  to: "sn7",  label: "" },
            { id: "se8",  from: "sn6",  to: "sn7",  label: "" },
            { id: "se9",  from: "sn7",  to: "sn8",  label: "Có" },
            { id: "se10", from: "sn7",  to: "sn9",  label: "Chưa" },
            { id: "se11", from: "sn8",  to: "sn10", label: "" },
            { id: "se12", from: "sn9",  to: "sn10", label: "" },
            { id: "se13", from: "sn10", to: "sn11", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_aff_14", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Tự động lấy hồ sơ và chỉ số Creator (follower, tỷ lệ tương tác, danh mục nội dung) trực tiếp từ <b>TikTok Creator Marketplace API</b> và <b>Shopee Affiliate Open API</b>, thay vì Marketing phải nhập tay từng trường.</p><p>Giúp dữ liệu <code>affiliate.creator.channel</code> luôn cập nhật gần với thực tế trên nền tảng — phục vụ đánh giá Creator nào đáng đầu tư seeding tiếp cho kỳ sau.</p>"
        },
        {
          id: "db_aff_15", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Kết nối tài khoản qua OAuth với từng nền tảng, lưu <code>access_token</code> + <code>refresh_token</code> vào <code>affiliate.api.credential</code></li><li>Cron job chạy đồng bộ mỗi 24h (hoặc bấm \"Đồng bộ ngay\" thủ công)</li><li>Trước mỗi lần gọi API, kiểm tra <code>expires_at</code> — hết hạn thì refresh token trước</li><li>Gọi API tương ứng theo <code>platform</code> để lấy hồ sơ + chỉ số Creator mới nhất</li><li>Match theo <code>external_id</code>: nếu đã có channel thì cập nhật, chưa có thì tạo Creator + channel mới</li><li>Ghi lại kết quả (thành công/lỗi/rate limit) vào <code>affiliate.api.sync.log</code> để truy vết khi có sự cố</li></ol>"
        },
        {
          id: "db_aff_16", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Không gọi API trực tiếp khi <code>access_token</code> đã hết hạn — luôn refresh trước để tránh bị nền tảng khoá tạm ứng dụng do gọi lỗi liên tục</li><li><b>Rate limit</b>: cả TikTok và Shopee đều giới hạn số request/phút — nên đồng bộ theo lô (batch) thay vì gọi từng Creator một lúc cao điểm</li><li>Nếu 1 Creator đồng bộ lỗi (<code>result = failed</code>), không chặn toàn bộ batch — bỏ qua và log lại để retry ở lần chạy sau</li><li><code>external_id</code> là khoá match duy nhất giữa dữ liệu nội bộ và nền tảng — không được sinh trùng giữa 2 platform khác nhau</li></ul>"
        }
      ],
      integrations: [
        { id: "int_aff_4", module: "TikTok Creator Marketplace API", icon: "ti-brand-tiktok", color: "#374151", direction: "in",
          content: "<p>Lấy hồ sơ Creator, số follower, tỷ lệ tương tác và danh mục nội dung theo <code>external_id</code> (Open ID) qua OAuth. Dữ liệu đổ về <code>affiliate.creator.channel</code>.</p><p>Cần xin quyền (scope) đọc hồ sơ Creator khi đăng ký app trên TikTok for Business.</p>" },
        { id: "int_aff_5", module: "Shopee Affiliate Open API", icon: "ti-shopping-bag", color: "#D97706", direction: "in",
          content: "<p>Lấy hồ sơ Creator/Cộng tác viên và số liệu hoa hồng đã ghi nhận trên sàn Shopee, đối chiếu chéo với <code>affiliate.tracking.link</code> để phát hiện chênh lệch giữa 2 hệ thống.</p>" }
      ],
      notes: "Cân nhắc thêm bước cảnh báo (email/Slack) khi 1 platform bị revoke quyền truy cập giữa chừng — hiện chỉ log lỗi trong affiliate.api.sync.log, chưa có noti chủ động.",
      cases: [
        {
          id: "cs_aff_1",
          title: "Đồng bộ TikTok bị chặn do gọi API dồn dập",
          status: "resolved",
          chatLink: "",
          description: "Lần đầu bật đồng bộ cho ~300 Creator, hệ thống gọi API gần như đồng thời khiến TikTok trả về lỗi rate limit hàng loạt, một số Creator bị đánh dấu 'error' dù dữ liệu vẫn đúng.",
          images: [],
          cause: "Job đồng bộ gọi tuần tự nhưng không có độ trễ (delay) giữa các request, vượt ngưỡng request/phút cho phép của TikTok Creator Marketplace API.",
          resolution: "Thêm giới hạn tốc độ (throttle) giữa các lần gọi + chia nhỏ theo batch 20 Creator/lần, cách nhau vài giây. Các Creator lỗi do rate limit được tự động retry ở lượt chạy kế tiếp thay vì phải đồng bộ tay lại."
        }
      ]
    }
  ]
};

export const HR = {
  id: "mod_hr",
  name: "HR",
  tech: "hr",
  color: "#5BAA50",
  status: "studying",
  updatedAt: "2026-09-09",
  overview: {
    version: "18.0",
    category: "Nhân sự",
    depends: "base, mail, resource",
    menu: "Employees ▸ Employees",
    purpose: "Hồ sơ nhân viên, phòng ban, chức danh. Cơ sở cho các module Attendance / Payroll / Recruitment."
  },
  mainFlows: [
    {
      id: "mf_hr_1",
      name: "Vòng đời nhân viên — Tuyển dụng → Onboarding → Làm việc → Nghỉ việc",
      nodes: [
        { id: "hn1", type: "start",   label: "Có quyết định tuyển dụng",                           x: 40,   y: 160 },
        { id: "hn2", type: "task",    label: "Onboarding — tạo hồ sơ hr.employee, cấp tài khoản",   x: 280,  y: 160 },
        { id: "hn3", type: "task",    label: "Ký hợp đồng thử việc/chính thức (hr.contract)",       x: 520,  y: 160 },
        { id: "hn4", type: "task",    label: "Làm việc — chấm công & nghỉ phép hằng ngày",           x: 760,  y: 160 },
        { id: "hn5", type: "gateway", label: "Tiếp tục làm việc?",                                  x: 1000, y: 160 },
        { id: "hn6", type: "task",    label: "Gia hạn / chuyển hợp đồng chính thức",                x: 1240, y: 40  },
        { id: "hn7", type: "task",    label: "Nộp đơn nghỉ việc / chấm dứt hợp đồng",                x: 1240, y: 300 },
        { id: "hn8", type: "task",    label: "Offboarding — thu hồi tài sản, chốt công nợ lương",   x: 1480, y: 300 },
        { id: "hn9", type: "end",     label: "Nhân viên tiếp tục gắn bó",                           x: 1480, y: 40  },
        { id: "hn10", type: "end",    label: "Đã nghỉ việc — archive hồ sơ",                        x: 1720, y: 300 }
      ],
      edges: [
        { id: "hne1", from: "hn1", to: "hn2", label: "" },
        { id: "hne2", from: "hn2", to: "hn3", label: "" },
        { id: "hne3", from: "hn3", to: "hn4", label: "" },
        { id: "hne4", from: "hn4", to: "hn5", label: "" },
        { id: "hne5", from: "hn5", to: "hn6", label: "Có" },
        { id: "hne6", from: "hn5", to: "hn7", label: "Không / hết hạn" },
        { id: "hne7", from: "hn6", to: "hn9", label: "" },
        { id: "hne8", from: "hn6", to: "hn4", label: "Tiếp tục chu kỳ" },
        { id: "hne9", from: "hn7", to: "hn8", label: "" },
        { id: "hne10", from: "hn8", to: "hn10", label: "" }
      ]
    }
  ],
  features: [
    {
      id: "f_hr_1",
      name: "Hồ sơ nhân viên & Cơ cấu tổ chức",
      desc: "hr.employee, hr.department, hr.job — nền tảng dữ liệu nhân sự",
      models: {
        cards: [
          {
            id: "mc_emp", name: "hr.employee", color: "#5BAA50", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",                 type: "Char",      desc: "Họ tên nhân viên", req: true },
              { name: "work_email",           type: "Char",      desc: "Email công ty" },
              { name: "department_id",        type: "Many2one",  desc: "Phòng ban",              req: true, relTo: "mc_dept" },
              { name: "job_id",                type: "Many2one",  desc: "Chức danh / vị trí",     req: true, relTo: "mc_job" },
              { name: "parent_id",            type: "Many2one",  desc: "Quản lý trực tiếp (self-reference)", relTo: "mc_emp" },
              { name: "coach_id",             type: "Many2one",  desc: "Người hướng dẫn (buddy/coach)", relTo: "mc_emp" },
              { name: "resource_calendar_id", type: "Many2one",  desc: "Lịch làm việc (ca hành chính/ca xoay)" },
              { name: "employee_type",        type: "Selection", desc: "employee/student/trainee/contractor/freelance" },
              { name: "identification_id",    type: "Char",      desc: "Số CCCD/CMND" }
            ]
          },
          {
            id: "mc_dept", name: "hr.department", color: "#378ADD", x: 440, y: 40, width: 300,
            fields: [
              { name: "name",       type: "Char",     desc: "Tên phòng ban", req: true },
              { name: "parent_id",  type: "Many2one",  desc: "Phòng ban cha (self-reference)", relTo: "mc_dept" },
              { name: "manager_id", type: "Many2one",  desc: "Trưởng phòng", relTo: "mc_emp" },
              { name: "member_ids", type: "One2many",  desc: "Danh sách nhân viên thuộc phòng", relTo: "mc_emp" }
            ]
          },
          {
            id: "mc_job", name: "hr.job", color: "#D97706", x: 440, y: 320, width: 300,
            fields: [
              { name: "name",              type: "Char",     desc: "Tên chức danh (vd: Kế toán viên)", req: true },
              { name: "department_id",     type: "Many2one", desc: "Thuộc phòng ban", relTo: "mc_dept" },
              { name: "no_of_recruitment", type: "Integer",  desc: "Số lượng cần tuyển" },
              { name: "no_of_employee",    type: "Integer",  desc: "Số nhân viên hiện tại (computed)" },
              { name: "description",       type: "Text",     desc: "Mô tả công việc (JD)" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_hr_1",
          name: "Onboarding nhân viên mới",
          nodes: [
            { id: "on1", type: "start",     label: "Có quyết định tuyển dụng / offer đã ký",           x: 40,   y: 160 },
            { id: "on2", type: "task",      label: "Tạo hồ sơ hr.employee (draft)",                     x: 280,  y: 160 },
            { id: "on3", type: "task",      label: "Gán department_id + job_id + coach_id/parent_id",   x: 520,  y: 160 },
            { id: "on4", type: "gateway",   label: "Đủ hồ sơ pháp lý (CCCD/BHXH/MST)?",                 x: 760,  y: 160 },
            { id: "on5", type: "user_task", label: "Nhân viên bổ sung qua Employee Portal",              x: 760,  y: 340 },
            { id: "on6", type: "task",      label: "Cấp tài khoản hệ thống — tạo res.users liên kết",   x: 1000, y: 160 },
            { id: "on7", type: "task",      label: "Setup checklist thiết bị & email nội bộ",           x: 1240, y: 160 },
            { id: "on8", type: "end",       label: "Nhân viên chính thức có mặt ngày đầu (Day 1)",      x: 1480, y: 160 }
          ],
          edges: [
            { id: "oe1", from: "on1", to: "on2", label: "" },
            { id: "oe2", from: "on2", to: "on3", label: "" },
            { id: "oe3", from: "on3", to: "on4", label: "" },
            { id: "oe4", from: "on4", to: "on6", label: "Đủ hồ sơ" },
            { id: "oe5", from: "on4", to: "on5", label: "Thiếu" },
            { id: "oe6", from: "on5", to: "on4", label: "Đã bổ sung" },
            { id: "oe7", from: "on6", to: "on7", label: "" },
            { id: "oe8", from: "on7", to: "on8", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_hr_1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Xây dựng nguồn dữ liệu nhân sự tập trung duy nhất (<code>hr.employee</code>) làm nền tảng cho toàn bộ hệ sinh thái HR: Chấm công, Nghỉ phép, Hợp đồng, và sau này là Payroll/Recruitment.</p><p>Cơ cấu tổ chức được mô hình theo cây phân cấp <b>Phòng ban (hr.department)</b> — <b>Chức danh (hr.job)</b> — <b>Nhân viên</b>, cho phép truy vết quản lý trực tiếp (<code>parent_id</code>) và tính chi phí theo phòng ban.</p>"
        },
        {
          id: "db_hr_2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>HR tạo phòng ban (<code>hr.department</code>) theo sơ đồ tổ chức, gán <code>manager_id</code> và <code>parent_id</code> nếu có phòng ban cha (vd: Phòng Kế toán thuộc Khối Vận hành)</li><li>Khai báo chức danh (<code>hr.job</code>) gắn với từng phòng ban, set <code>no_of_recruitment</code> nếu đang tuyển</li><li>Tạo hồ sơ nhân viên mới (<code>hr.employee</code>) — chọn <code>department_id</code>, <code>job_id</code>, <code>parent_id</code> (quản lý trực tiếp), <code>coach_id</code> (người hướng dẫn 30 ngày đầu)</li><li>Xem <b>Org Chart</b> trên form nhân viên để kiểm tra chuỗi báo cáo đúng chưa</li><li>Cấp tài khoản đăng nhập (liên kết <code>res.users</code>) để nhân viên tự truy cập Employee Portal</li></ol>"
        },
        {
          id: "db_hr_3", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li><code>parent_id</code> trên <code>hr.employee</code> mặc định lấy theo <code>manager_id</code> của <code>department_id</code> — nhưng có thể override tay nếu nhân viên báo cáo chéo phòng ban</li><li><code>hr.job.no_of_employee</code> là trường <mark style='background:#FEF08A'>computed</mark>, tự đếm theo <code>hr.employee</code> đang active gắn job đó — không sửa tay được</li><li>Xoá/archive phòng ban đang có nhân viên active sẽ bị chặn — phải chuyển hết nhân viên sang phòng ban khác trước</li><li>Mỗi nhân viên chỉ có <b>1 department_id</b> chính thức tại một thời điểm (không hỗ trợ multi-department native, cần customization nếu khách yêu cầu)</li></ul>"
        }
      ],
      integrations: [
        { id: "int_hr_1", module: "mail", icon: "ti-mail", color: "#2563EB", direction: "out",
          content: "<p>Khi tạo hồ sơ nhân viên mới, hệ thống gửi thông báo chatter đến <code>manager_id</code> và <code>coach_id</code>, đồng thời log hoạt động nhắc chuẩn bị thiết bị/tài khoản trước ngày <b>Day 1</b>.</p>" },
        { id: "int_hr_2", module: "payroll (khái niệm)", icon: "ti-cash", color: "#D97706", direction: "out",
          content: "<p>Dữ liệu <code>department_id</code>/<code>job_id</code> trên hồ sơ nhân viên là nền cho cơ cấu chi phí lương theo phòng ban khi triển khai module <b>Payroll</b> sau này — mỗi <code>hr.contract</code> đều tham chiếu ngược lại <code>employee_id</code> đang khai báo ở đây.</p>" }
      ],
      notes: "Cân nhắc bật multi-company nếu khách có nhiều pháp nhân — mỗi hr.employee chỉ thuộc 1 company_id.",
      cases: [
        {
          id: "cs_hr_1",
          title: "Nhân viên mới không hiện trong Org Chart của phòng ban",
          status: "resolved",
          chatLink: "",
          description: "Sau khi tạo hồ sơ nhân viên mới và gán department_id đúng, nhân viên vẫn không xuất hiện trên sơ đồ tổ chức (Org Chart) khi xem từ phòng ban.",
          images: [],
          cause: "Trường parent_id (quản lý trực tiếp) bị bỏ trống khi tạo nhanh qua Import — Org Chart dựng cây theo parent_id chứ không phải department_id.",
          resolution: "Bổ sung parent_id cho các bản ghi import thiếu, hoặc thêm cột parent_id bắt buộc trong file import mẫu. Có thể chạy action hàng loạt để auto-set parent_id = manager_id của department_id."
        }
      ]
    },
    {
      id: "f_hr_2",
      name: "Chấm công & Nghỉ phép",
      desc: "hr.attendance, hr.leave, hr.leave.type — check-in/out và duyệt phép",
      models: {
        cards: [
          {
            id: "mc_att", name: "hr.attendance", color: "#5BAA50", x: 40, y: 40, width: 300,
            fields: [
              { name: "employee_id",  type: "Many2one",  desc: "Nhân viên chấm công", req: true, relTo: "mc_emp2" },
              { name: "check_in",     type: "Datetime",  desc: "Thời điểm vào", req: true },
              { name: "check_out",    type: "Datetime",  desc: "Thời điểm ra" },
              { name: "worked_hours", type: "Float",     desc: "Số giờ làm (computed = check_out − check_in)" },
              { name: "in_mode",      type: "Selection",  desc: "manual/kiosk/systray/technical (nguồn check-in)" }
            ]
          },
          {
            id: "mc_leave", name: "hr.leave", color: "#7C3AED", x: 420, y: 40, width: 320,
            fields: [
              { name: "employee_id",       type: "Many2one",  desc: "Nhân viên xin nghỉ", req: true, relTo: "mc_emp2" },
              { name: "holiday_status_id", type: "Many2one",  desc: "Loại phép",          req: true, relTo: "mc_leavetype" },
              { name: "date_from",         type: "Datetime",  desc: "Từ ngày", req: true },
              { name: "date_to",           type: "Datetime",  desc: "Đến ngày", req: true },
              { name: "number_of_days",    type: "Float",     desc: "Số ngày nghỉ (computed)" },
              { name: "state",             type: "Selection", desc: "draft/confirm/validate1/validate/refuse" },
              { name: "first_approver_id", type: "Many2one",  desc: "Người duyệt cấp 1 (quản lý trực tiếp)" }
            ]
          },
          {
            id: "mc_leavetype", name: "hr.leave.type", color: "#D97706", x: 420, y: 360, width: 320,
            fields: [
              { name: "name",                  type: "Char",      desc: "Tên loại phép: Phép năm/Nghỉ ốm/Không lương", req: true },
              { name: "requires_allocation",   type: "Selection", desc: "yes/no — có giới hạn số ngày không" },
              { name: "leave_validation_type", type: "Selection", desc: "no_validation/hr/manager/both" },
              { name: "color",                 type: "Integer",   desc: "Màu hiển thị trên lịch" }
            ]
          },
          {
            id: "mc_emp2", name: "hr.employee", color: "#374151", x: 40, y: 360, width: 300,
            fields: [
              { name: "name",                 type: "Char",     desc: "Họ tên nhân viên", req: true },
              { name: "department_id",        type: "Many2one", desc: "Phòng ban" },
              { name: "resource_calendar_id", type: "Many2one", desc: "Lịch làm việc chuẩn (giờ công/tuần)" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_hr_2a",
          name: "Chấm công vào/ra hằng ngày",
          nodes: [
            { id: "at1", type: "start",   label: "Nhân viên đến nơi làm việc",                          x: 40,   y: 160 },
            { id: "at2", type: "task",    label: "Check-in (Kiosk/App/GPS) → tạo hr.attendance",         x: 280,  y: 160 },
            { id: "at3", type: "gateway", label: "Check-in sau giờ quy định?",                           x: 520,  y: 160 },
            { id: "at4", type: "task",    label: "Đánh dấu đi trễ (late) — cảnh báo Manager",             x: 520,  y: 340 },
            { id: "at5", type: "task",    label: "Làm việc trong ngày",                                  x: 760,  y: 160 },
            { id: "at6", type: "task",    label: "Check-out → cập nhật check_out, tính worked_hours",     x: 1000, y: 160 },
            { id: "at7", type: "gateway", label: "worked_hours < giờ chuẩn?",                             x: 1240, y: 160 },
            { id: "at8", type: "task",    label: "Gắn cờ thiếu giờ — chờ giải trình",                     x: 1240, y: 340 },
            { id: "at9", type: "end",     label: "Bản ghi attendance hoàn tất trong ngày",                x: 1480, y: 160 }
          ],
          edges: [
            { id: "ate1", from: "at1", to: "at2", label: "" },
            { id: "ate2", from: "at2", to: "at3", label: "" },
            { id: "ate3", from: "at3", to: "at4", label: "Có" },
            { id: "ate4", from: "at3", to: "at5", label: "Không" },
            { id: "ate5", from: "at4", to: "at5", label: "" },
            { id: "ate6", from: "at5", to: "at6", label: "" },
            { id: "ate7", from: "at6", to: "at7", label: "" },
            { id: "ate8", from: "at7", to: "at8", label: "Có" },
            { id: "ate9", from: "at7", to: "at9", label: "Không" },
            { id: "ate10", from: "at8", to: "at9", label: "" }
          ]
        },
        {
          id: "fl_hr_2b",
          name: "Xin nghỉ phép & Duyệt",
          nodes: [
            { id: "lv1",  type: "start",     label: "Nhân viên tạo đơn xin nghỉ (hr.leave)",           x: 40,   y: 160 },
            { id: "lv2",  type: "task",      label: "Chọn holiday_status_id + date_from/date_to",       x: 280,  y: 160 },
            { id: "lv3",  type: "gateway",   label: "Đủ số ngày phép còn lại (allocation)?",             x: 520,  y: 160 },
            { id: "lv4",  type: "end",       label: "Từ chối tự động — không đủ phép",                   x: 520,  y: 340 },
            { id: "lv5",  type: "task",      label: "Gửi duyệt — state = confirm",                       x: 760,  y: 160 },
            { id: "lv6",  type: "user_task", label: "Quản lý trực tiếp duyệt (Approve 1)",               x: 1000, y: 160 },
            { id: "lv7",  type: "gateway",   label: "Manager duyệt?",                                    x: 1240, y: 160 },
            { id: "lv8",  type: "end",       label: "Từ chối — state = refuse",                          x: 1240, y: 340 },
            { id: "lv9",  type: "gateway",   label: "Loại phép cần duyệt 2 cấp (HR)?",                   x: 1480, y: 60  },
            { id: "lv10", type: "user_task", label: "HR duyệt lần 2 (Approve 2)",                        x: 1720, y: 60  },
            { id: "lv11", type: "end",       label: "Đơn được duyệt — state = validate, trừ phép",       x: 1960, y: 160 }
          ],
          edges: [
            { id: "lve1",  from: "lv1", to: "lv2",  label: "" },
            { id: "lve2",  from: "lv2", to: "lv3",  label: "" },
            { id: "lve3",  from: "lv3", to: "lv4",  label: "Không đủ" },
            { id: "lve4",  from: "lv3", to: "lv5",  label: "Đủ" },
            { id: "lve5",  from: "lv5", to: "lv6",  label: "" },
            { id: "lve6",  from: "lv6", to: "lv7",  label: "" },
            { id: "lve7",  from: "lv7", to: "lv8",  label: "Từ chối" },
            { id: "lve8",  from: "lv7", to: "lv9",  label: "Đồng ý" },
            { id: "lve9",  from: "lv9", to: "lv10", label: "Cần 2 cấp" },
            { id: "lve10", from: "lv9", to: "lv11", label: "Chỉ cần 1 cấp" },
            { id: "lve11", from: "lv10", to: "lv11", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_hr_4", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Ghi nhận chính xác giờ công thực tế qua <code>hr.attendance</code> (check-in/out) và quản lý toàn bộ vòng đời đơn xin nghỉ qua <code>hr.leave</code> — làm cơ sở tính công cho Payroll và đảm bảo tuân thủ chính sách nghỉ phép nội bộ.</p><p>Áp dụng cho cả nhân viên văn phòng (chấm công qua Kiosk/App) và nhân viên làm việc từ xa (chấm công qua hệ thống/systray).</p>"
        },
        {
          id: "db_hr_5", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li><b>Chấm công:</b> nhân viên check-in đầu ca qua Kiosk Mode/App di động/GPS → tạo <code>hr.attendance</code> với <code>check_in</code> = thời gian thực</li><li>Cuối ca, check-out → hệ thống ghi <code>check_out</code> và tự tính <code>worked_hours</code></li><li><b>Xin nghỉ phép:</b> nhân viên tạo <code>hr.leave</code>, chọn <code>holiday_status_id</code> và khoảng ngày nghỉ</li><li>Hệ thống kiểm tra số ngày phép còn lại (<code>hr.leave.allocation</code>) trước khi cho gửi duyệt</li><li>Đơn chuyển <code>state=confirm</code> → quản lý trực tiếp duyệt → (nếu loại phép yêu cầu) HR duyệt cấp 2 → <code>state=validate</code>, trừ vào số dư phép</li></ol>"
        },
        {
          id: "db_hr_6", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li><code>worked_hours</code> tính âm hoặc bất thường nếu nhân viên quên check-out — cần cấu hình cảnh báo hoặc auto check-out cuối ngày</li><li><code>leave_validation_type = both</code> bắt buộc <mark style='background:#FEF08A'>2 cấp duyệt</mark> (Manager rồi HR) mới chuyển được <code>state=validate</code></li><li>Không cho tạo <code>hr.leave</code> chồng ngày với bản ghi đã <code>validate</code> khác của cùng nhân viên</li><li>Phép năm (<code>requires_allocation=yes</code>) chỉ gửi duyệt được nếu còn đủ số dư trong <code>hr.leave.allocation</code> tương ứng</li></ul>"
        }
      ],
      integrations: [
        { id: "int_hr_3", module: "calendar", icon: "ti-calendar", color: "#EC4899", direction: "bidi",
          content: "<p>Đơn nghỉ phép đã <code>validate</code> tự động chặn lịch (<code>resource.calendar.leaves</code>) — nhân viên sẽ không bị xếp lịch họp/công việc trong thời gian nghỉ.</p>" },
        { id: "int_hr_4", module: "payroll (khái niệm)", icon: "ti-cash", color: "#D97706", direction: "out",
          content: "<p><code>worked_hours</code> từ Attendance và số ngày nghỉ không lương từ Leave là 2 nguồn dữ liệu đầu vào chính để tính lương thực nhận khi triển khai <b>Payroll</b> — mỗi kỳ lương sẽ đối chiếu ngược lại các bản ghi này theo <code>employee_id</code>.</p>" }
      ],
      notes: "",
      cases: [
        {
          id: "cs_hr_2",
          title: "Đơn nghỉ phép đã duyệt nhưng không trừ số dư phép",
          status: "investigating",
          chatLink: "",
          description: "Nhân viên xin nghỉ phép năm, đơn được cả quản lý và HR duyệt (state=validate) nhưng số dư Phép năm còn lại trên hồ sơ không giảm tương ứng.",
          images: [],
          cause: "Nghi vấn allocation (hr.leave.allocation) của nhân viên thuộc năm cũ đã hết hạn (expiring) trong khi đơn nghỉ rơi vào năm mới, hệ thống trừ nhầm allocation rỗng thay vì cảnh báo thiếu phép.",
          resolution: "Đang phối hợp kiểm tra Accrual Plan và ngày hết hạn allocation; tạm thời yêu cầu HR kiểm tra thủ công số dư trước khi duyệt đơn giáp ranh năm."
        }
      ]
    },
    {
      id: "f_hr_3",
      name: "Hợp đồng & Lương cơ bản",
      desc: "hr.contract (wage, structure) — tạo → ký → kích hoạt, thử việc & gia hạn",
      models: {
        cards: [
          {
            id: "mc_contract", name: "hr.contract", color: "#5BAA50", x: 40, y: 40, width: 320,
            fields: [
              { name: "employee_id",      type: "Many2one",  desc: "Nhân viên", req: true, relTo: "mc_emp3" },
              { name: "job_id",           type: "Many2one",  desc: "Chức danh áp dụng" },
              { name: "contract_type_id", type: "Many2one",  desc: "Loại hợp đồng", req: true, relTo: "mc_ctype" },
              { name: "date_start",       type: "Date",      desc: "Ngày bắt đầu", req: true },
              { name: "date_end",         type: "Date",      desc: "Ngày kết thúc (nếu có thời hạn/thử việc)" },
              { name: "trial_date_end",   type: "Date",      desc: "Ngày kết thúc thử việc" },
              { name: "wage",             type: "Monetary",  desc: "Lương cơ bản (gross)", req: true },
              { name: "structure_type_id",type: "Many2one",  desc: "Cơ cấu lương áp dụng", relTo: "mc_structure" },
              { name: "state",            type: "Selection", desc: "draft/open/close/cancel" }
            ]
          },
          {
            id: "mc_ctype", name: "hr.contract.type", color: "#D97706", x: 440, y: 40, width: 300,
            fields: [
              { name: "name",     type: "Char",    desc: "Tên loại: Thử việc/Xác định thời hạn/Không xác định thời hạn", req: true },
              { name: "sequence", type: "Integer", desc: "Thứ tự hiển thị" }
            ]
          },
          {
            id: "mc_structure", name: "hr.payroll.structure.type", color: "#2563EB", x: 440, y: 280, width: 300,
            fields: [
              { name: "name",                         type: "Char",     desc: "Tên cơ cấu lương: Nhân viên văn phòng/Sales hoa hồng…", req: true },
              { name: "wage_type",                    type: "Selection",desc: "monthly/hourly" },
              { name: "default_resource_calendar_id", type: "Many2one", desc: "Lịch làm việc mặc định" }
            ]
          },
          {
            id: "mc_emp3", name: "hr.employee", color: "#374151", x: 40, y: 360, width: 320,
            fields: [
              { name: "name",          type: "Char",     desc: "Họ tên nhân viên", req: true },
              { name: "department_id", type: "Many2one", desc: "Phòng ban" },
              { name: "job_id",        type: "Many2one", desc: "Chức danh hiện tại" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_hr_3",
          name: "Tạo → Ký → Kích hoạt hợp đồng (kèm thử việc & gia hạn)",
          nodes: [
            { id: "ct1",  type: "start",     label: "Offer được duyệt, chuẩn bị hợp đồng",                x: 40,   y: 220 },
            { id: "ct2",  type: "task",      label: "Tạo hr.contract (draft) — wage, structure_type_id",  x: 280,  y: 220 },
            { id: "ct3",  type: "task",      label: "Gửi ký điện tử (nhân viên + đại diện công ty)",       x: 520,  y: 220 },
            { id: "ct4",  type: "gateway",   label: "Đã ký đủ 2 bên?",                                     x: 760,  y: 220 },
            { id: "ct5",  type: "user_task", label: "Nhắc ký lại",                                         x: 760,  y: 60  },
            { id: "ct6",  type: "task",      label: "Kích hoạt hợp đồng — state = open",                   x: 1000, y: 220 },
            { id: "ct7",  type: "gateway",   label: "Loại hợp đồng = Thử việc?",                           x: 1240, y: 220 },
            { id: "ct8",  type: "user_task", label: "Manager đánh giá cuối kỳ thử việc",                    x: 1480, y: 80  },
            { id: "ct9",  type: "gateway",   label: "Đạt yêu cầu thử việc?",                                x: 1720, y: 80  },
            { id: "ct10", type: "end",       label: "Chuyển hợp đồng chính thức",                          x: 1960, y: 20  },
            { id: "ct11", type: "end",       label: "Chấm dứt hợp đồng thử việc",                          x: 1960, y: 160 },
            { id: "ct12", type: "gateway",   label: "Sắp hết hạn hợp đồng (date_end)?",                    x: 1480, y: 380 },
            { id: "ct13", type: "user_task", label: "HR nhắc gia hạn trước 30 ngày",                        x: 1720, y: 380 },
            { id: "ct14", type: "task",      label: "Tạo hợp đồng gia hạn mới",                             x: 1960, y: 380 },
            { id: "ct15", type: "end",       label: "Hợp đồng gia hạn có hiệu lực",                        x: 2200, y: 380 },
            { id: "ct16", type: "end",       label: "Hợp đồng vẫn đang hiệu lực bình thường",               x: 1720, y: 520 }
          ],
          edges: [
            { id: "cte1",  from: "ct1",  to: "ct2",  label: "" },
            { id: "cte2",  from: "ct2",  to: "ct3",  label: "" },
            { id: "cte3",  from: "ct3",  to: "ct4",  label: "" },
            { id: "cte4",  from: "ct4",  to: "ct6",  label: "Đủ chữ ký" },
            { id: "cte5",  from: "ct4",  to: "ct5",  label: "Thiếu" },
            { id: "cte6",  from: "ct5",  to: "ct3",  label: "Ký lại" },
            { id: "cte7",  from: "ct6",  to: "ct7",  label: "" },
            { id: "cte8",  from: "ct7",  to: "ct8",  label: "Có" },
            { id: "cte9",  from: "ct7",  to: "ct12", label: "Không" },
            { id: "cte10", from: "ct8",  to: "ct9",  label: "" },
            { id: "cte11", from: "ct9",  to: "ct10", label: "Đạt" },
            { id: "cte12", from: "ct9",  to: "ct11", label: "Không đạt" },
            { id: "cte13", from: "ct12", to: "ct13", label: "Sắp hết hạn" },
            { id: "cte14", from: "ct12", to: "ct16", label: "Còn hạn dài" },
            { id: "cte15", from: "ct13", to: "ct14", label: "" },
            { id: "cte16", from: "ct14", to: "ct15", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_hr_7", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Quản lý toàn bộ vòng đời hợp đồng lao động (<code>hr.contract</code>) từ soạn thảo, ký kết, kích hoạt đến theo dõi thử việc và gia hạn — đảm bảo tại mỗi thời điểm mỗi nhân viên chỉ có đúng 1 hợp đồng <code>state=open</code> làm cơ sở tính lương.</p><p><code>wage</code> và <code>structure_type_id</code> là 2 trường then chốt, sẽ được Payroll đọc để tính lương kỳ tới khi module này được triển khai.</p>"
        },
        {
          id: "db_hr_8", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>HR soạn hợp đồng nháp — tạo <code>hr.contract</code> (<code>state=draft</code>), nhập <code>wage</code>, chọn <code>contract_type_id</code> và <code>structure_type_id</code></li><li>Nếu là hợp đồng thử việc, nhập <code>trial_date_end</code></li><li>Gửi hợp đồng cho nhân viên và đại diện công ty ký (điện tử hoặc bản cứng)</li><li>Đủ 2 chữ ký → HR bấm <b>Kích hoạt</b> → <code>state=open</code></li><li>Đến gần <code>trial_date_end</code>, Manager đánh giá — đạt thì tạo hợp đồng chính thức mới, không đạt thì chấm dứt</li><li>Với hợp đồng có <code>date_end</code>, hệ thống nhắc HR trước 30 ngày để quyết định gia hạn hay chấm dứt</li></ol>"
        },
        {
          id: "db_hr_9", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Một nhân viên chỉ được có <mark style='background:#FEF08A'>1 hợp đồng state=open</mark> tại một thời điểm — kích hoạt hợp đồng mới phải tự đóng hợp đồng cũ (<code>state=close</code>)</li><li><code>date_end</code> bắt buộc nếu <code>contract_type_id</code> là loại có thời hạn hoặc thử việc; để trống nếu là hợp đồng không xác định thời hạn</li><li>Sửa <code>wage</code> trên hợp đồng đang <code>open</code> chỉ nên thực hiện qua tạo phụ lục/hợp đồng mới, không sửa trực tiếp để giữ lịch sử lương</li><li>Hợp đồng <code>state=cancel</code> vẫn giữ lại trong hệ thống để phục vụ audit, không xoá cứng</li></ul>"
        }
      ],
      integrations: [
        { id: "int_hr_5", module: "account", icon: "ti-calculator", color: "#2563EB", direction: "out",
          content: "<p><code>wage</code> theo <code>structure_type_id</code> là đầu vào để hạch toán chi phí lương (khi có Payroll) vào <code>account.move</code> theo từng phòng ban — phục vụ báo cáo chi phí nhân sự.</p>" },
        { id: "int_hr_6", module: "calendar", icon: "ti-calendar", color: "#EC4899", direction: "out",
          content: "<p>Các mốc <code>trial_date_end</code> và <code>date_end</code> sắp tới được đẩy thành hoạt động nhắc nhở (<code>mail.activity</code>) cho HR — tương tự cơ chế nhắc lịch bên CRM — để không bỏ sót đánh giá thử việc hay gia hạn hợp đồng.</p>" }
      ],
      notes: "",
      cases: [
        {
          id: "cs_hr_3",
          title: "Kích hoạt hợp đồng mới nhưng hợp đồng cũ không tự đóng",
          status: "open",
          chatLink: "",
          description: "Sau khi ký phụ lục tăng lương và kích hoạt hợp đồng mới cho nhân viên, hợp đồng cũ vẫn ở state=open — nhân viên có 2 hợp đồng active cùng lúc, gây sai số khi sau này tính lương.",
          images: [],
          cause: "Hợp đồng mới được tạo bằng cách Duplicate từ hợp đồng cũ thay vì dùng action chuẩn 'Generate New Contract', nên logic tự đóng hợp đồng trước đó (set state=close, date_end=ngày trước date_start mới) không được kích hoạt.",
          resolution: "Đang đề xuất chuẩn hoá quy trình: chỉ tạo hợp đồng mới qua action có sẵn hoặc bổ sung automated action kiểm tra và tự đóng hợp đồng open trùng employee_id khi có hợp đồng open khác được kích hoạt."
        }
      ]
    }
  ]
};

/* ── Sample projects (for demo) ── */
export const SAMPLE_PROJECTS = [
  {
    id: "proj_ntx",
    client: "Nội Thất Xanh",
    industry: "Sản xuất & Bán lẻ Nội thất",
    name: "Triển khai Odoo 18 — Sales & CRM",
    status: "demo",
    startDate: "2026-04-01",
    endDate: "2026-07-31",
    color: "#378ADD",
    description: "Triển khai module Sales + CRM cho chuỗi 5 showroom nội thất, đồng bộ tồn kho và pipeline bán hàng.",
    updatedAt: "2026-06-10",
    tasks: [
      { id: "t_ntx1", name: "Gửi bảng báo giá license cho khách", done: true },
      { id: "t_ntx2", name: "Chốt danh sách trường dữ liệu import khách hàng cũ", done: true },
      { id: "t_ntx3", name: "Xác nhận lịch UAT với sales team 5 showroom", done: false },
      { id: "t_ntx4", name: "Chuẩn bị tài liệu đào tạo bản in", done: false }
    ],
    timeline: [
      {
        id: "tl_ntx1", title: "Khảo sát & Ký hợp đồng", start: "2026-04-01", end: "2026-04-15", progress: 100, type: "phase",
        children: [
          { id: "tl_ntx1a", title: "Ký hợp đồng triển khai", start: "2026-04-10", end: "2026-04-10", progress: 100, type: "milestone", children: [] },
          { id: "tl_ntx1b", title: "Bản khảo sát nghiệp vụ", start: "2026-04-05", end: "2026-04-08", progress: 100, type: "doc", children: [] }
        ]
      },
      {
        id: "tl_ntx2", title: "Setup & Cấu hình hệ thống", start: "2026-04-16", end: "2026-05-10", progress: 100, type: "phase",
        children: [
          { id: "tl_ntx2a", title: "Cài đặt server & Odoo 18", start: "2026-04-16", end: "2026-04-20", progress: 100, type: "event", children: [] },
          { id: "tl_ntx2b", title: "Khách yêu cầu thêm trường Mã số thuế trên Lead", start: "2026-04-25", end: "2026-04-25", progress: 100, type: "comment", children: [] }
        ]
      },
      {
        id: "tl_ntx3", title: "Triển khai CRM + Sales", start: "2026-05-11", end: "2026-06-20", progress: 65, type: "phase",
        children: [
          { id: "tl_ntx3a", title: "Demo Pipeline CRM cho quản lý", start: "2026-05-20", end: "2026-05-20", progress: 100, type: "milestone", children: [] },
          { id: "tl_ntx3b", title: "Import dữ liệu khách hàng cũ (2.400 KH)", start: "2026-05-22", end: "2026-06-05", progress: 80, type: "event", children: [] },
          { id: "tl_ntx3c", title: "UAT với sales team 5 showroom", start: "2026-06-15", end: "2026-06-20", progress: 0, type: "future", children: [] }
        ]
      },
      {
        id: "tl_ntx4", title: "Go-live & Đào tạo", start: "2026-06-21", end: "2026-07-31", progress: 10, type: "phase",
        children: [
          { id: "tl_ntx4a", title: "Đào tạo người dùng 5 showroom", start: "2026-07-01", end: "2026-07-10", progress: 0, type: "future", children: [] },
          { id: "tl_ntx4b", title: "Go-live chính thức", start: "2026-07-15", end: "2026-07-15", progress: 0, type: "future", children: [] }
        ]
      }
    ],
    features: [
      { id: "feat_ntx1",  name: "Thu thập lead từ Website & Zalo OA",     status: "done",      assignee: "Nguyễn Ngọc Anh", parentId: null,
        linkedFeature: { moduleId: "mod_crm", featureId: "f_crm_1", notebookName: "Odoo 18", moduleName: "CRM", featureName: "Thu thập & Phân loại Lead" } },
      { id: "feat_ntx1a", name: "Tích hợp Zalo OA vào crm.lead",         status: "studying",  assignee: "Trần Minh Quân",  parentId: "feat_ntx1", linkedFeature: null },
      { id: "feat_ntx2",  name: "Pipeline bán hàng theo từng showroom",  status: "deploying", assignee: "Nguyễn Ngọc Anh", parentId: null,
        linkedFeature: { moduleId: "mod_crm", featureId: "f_crm_2", notebookName: "Odoo 18", moduleName: "CRM", featureName: "Quản lý Pipeline cơ hội (Kanban)" } },
      { id: "feat_ntx3",  name: "Chốt deal → xuất báo giá tự động",      status: "pending",   assignee: "Trần Minh Quân",  parentId: null,
        linkedFeature: { moduleId: "mod_crm", featureId: "f_crm_4", notebookName: "Odoo 18", moduleName: "CRM", featureName: "Chốt deal & Chuyển thành đơn hàng" } },
      { id: "feat_ntx4",  name: "Đào tạo sales dùng app di động",        status: "overdue",   assignee: "Lê Thu Hà",       parentId: null, linkedFeature: null },
      { id: "feat_ntx5",  name: "Chốt tồn kho đầu kỳ 5 showroom",        status: "done",      assignee: "Lê Thu Hà",       parentId: null, linkedFeature: null }
    ],
    members: [
      { id: "mem_ntx1", name: "Nguyễn Ngọc Anh", type: "internal",  role: "Consultant trưởng", projectRole: "Project Lead",      phone: "0901234567", email: "ngocanh@company.vn",        supportPlatform: "zalo",  supportLink: "" },
      { id: "mem_ntx2", name: "Trần Minh Quân",  type: "internal",  role: "Odoo Developer",    projectRole: "Kỹ thuật",           phone: "0912345678", email: "quan.tran@company.vn",      supportPlatform: "teams", supportLink: "" },
      { id: "mem_ntx3", name: "Lê Thu Hà",       type: "freelance", role: "Business Analyst",  projectRole: "BA / Đào tạo",       phone: "0987654321", email: "ha.le.freelance@gmail.com", supportPlatform: "zalo",  supportLink: "" },
      { id: "mem_ntx4", name: "Phạm Văn Đức",    type: "ctv",       role: "CTV Import dữ liệu",projectRole: "Data migration",     phone: "0933111222", email: "",                          supportPlatform: "zalo",  supportLink: "" }
    ],
    chatGroups: [
      { id: "grp_ntx1", name: "NTX x Triển khai Odoo",      platform: "zalo",  description: "Nhóm chính trao đổi tiến độ hằng ngày với khách hàng", memberCount: 12, link: "" },
      { id: "grp_ntx2", name: "Internal — Team kỹ thuật",   platform: "teams", description: "Nhóm nội bộ dev + BA bàn kỹ thuật",                    memberCount: 5,  link: "" }
    ],
    docs: [
      { id: "doc_ntx1", name: "Hợp đồng triển khai Odoo 18",      link: "https://drive.google.com/", type: "contract", addedBy: "Nguyễn Ngọc Anh", updatedAt: "2026-04-10", parentId: null },
      { id: "doc_ntx2", name: "Đặc tả nghiệp vụ CRM & Sales",     link: "https://docs.google.com/document/", type: "spec",    addedBy: "Lê Thu Hà",       updatedAt: "2026-04-20", parentId: null },
      { id: "doc_ntx3", name: "Biên bản họp Demo Pipeline",       link: "https://docs.google.com/document/", type: "minutes", addedBy: "Trần Minh Quân",  updatedAt: "2026-05-20", parentId: null },
      { id: "doc_ntx4", name: "Hướng dẫn dùng CRM cho Sales",     link: "https://docs.google.com/document/", type: "guide",   addedBy: "Nguyễn Ngọc Anh", updatedAt: "2026-06-01", parentId: null }
    ],
    changelog: [
      { id: "cl_ntx4", date: "2026-06-05", version: "1.3", type: "feature",     status: "approved", impact: "high",   author: "Trần Minh Quân",  featureId: "feat_ntx2", title: "Hoàn tất cấu hình Pipeline theo showroom",    desc: "5 pipeline riêng cho từng showroom, phân quyền theo team." },
      { id: "cl_ntx3", date: "2026-05-28", version: "1.2", type: "fix",         status: "approved", impact: "medium", author: "Trần Minh Quân",  featureId: "",          title: "Sửa lỗi import trùng khách hàng",             desc: "2.400 bản ghi cũ bị trùng do thiếu check theo SĐT, đã thêm rule merge." },
      { id: "cl_ntx2", date: "2026-05-15", version: "1.1", type: "improvement", status: "review",   impact: "low",    author: "Lê Thu Hà",       featureId: "",          title: "Bổ sung trường Mã số thuế trên Lead",         desc: "Theo yêu cầu khách để xuất hoá đơn B2B nhanh hơn." },
      { id: "cl_ntx1", date: "2026-04-16", version: "1.0", type: "config",      status: "approved", impact: "medium", author: "Nguyễn Ngọc Anh", featureId: "",          title: "Setup môi trường & cấu hình công ty",         desc: "Khởi tạo database, company, users, phân quyền cơ bản." }
    ],
    notes: [
      { id: "note_ntx1", title: "Lưu ý khi go-live",  content: "Chốt tồn kho 5 showroom trước 23h59 ngày 20/6 để tránh lệch số khi chuyển hệ thống.", color: "yellow", pinned: true,  updatedAt: "2026-06-10T09:00" },
      { id: "note_ntx2", title: "Liên hệ khẩn",       content: "Anh Đức (IT khách hàng) — 090xxxxxxx — xử lý sự cố mạng/server tại showroom.",         color: "blue",   pinned: false, updatedAt: "2026-05-20T14:00" }
    ]
  },
  {
    id: "proj_mt",
    client: "Dược Phẩm Minh Tâm",
    industry: "Dược phẩm & Y tế",
    name: "Vận hành Odoo Kế toán & Kho",
    status: "operation",
    startDate: "2025-11-01",
    endDate: "2026-02-28",
    color: "#5BAA50",
    description: "Đã go-live module Kế toán + Kho cho 3 chi nhánh, hiện đang trong giai đoạn hỗ trợ vận hành.",
    updatedAt: "2026-05-02",
    tasks: [
      { id: "t_mt1", name: "Hỗ trợ đóng sổ kế toán tháng 4", done: true },
      { id: "t_mt2", name: "Đánh giá nhu cầu mở rộng module Purchase", done: false }
    ],
    timeline: [
      { id: "tl_mt1", title: "Triển khai Kế toán & Kho", start: "2025-11-01", end: "2026-01-15", progress: 100, type: "phase",
        children: [
          { id: "tl_mt1a", title: "Go-live chi nhánh Q1, Q3, Thủ Đức", start: "2026-01-15", end: "2026-01-15", progress: 100, type: "milestone", children: [] }
        ] },
      { id: "tl_mt2", title: "Hỗ trợ vận hành", start: "2026-01-16", end: "2026-02-28", progress: 100, type: "phase", children: [] },
      { id: "tl_mt3", title: "Đánh giá mở rộng Purchase", start: "2026-06-01", end: "2026-06-30", progress: 0, type: "future", children: [] }
    ],
    features: [
      { id: "feat_mt1", name: "Đóng sổ kế toán cuối tháng",   status: "done",     assignee: "Ngọc Anh", parentId: null, linkedFeature: null },
      { id: "feat_mt2", name: "Kiểm kê kho định kỳ 3 chi nhánh", status: "done",  assignee: "Minh Quân", parentId: null, linkedFeature: null },
      { id: "feat_mt3", name: "Mở rộng module Purchase",      status: "pending",  assignee: "",         parentId: null, linkedFeature: null }
    ],
    members: [
      { id: "mem_mt1", name: "Nguyễn Ngọc Anh", type: "internal", role: "Consultant trưởng", projectRole: "Account Manager", phone: "0901234567", email: "ngocanh@company.vn", supportPlatform: "zalo", supportLink: "" },
      { id: "mem_mt2", name: "Trần Minh Quân",  type: "internal", role: "Odoo Developer",    projectRole: "Hỗ trợ kỹ thuật", phone: "0912345678", email: "quan.tran@company.vn", supportPlatform: "zalo", supportLink: "" }
    ],
    chatGroups: [
      { id: "grp_mt1", name: "Minh Tâm — Hỗ trợ vận hành", platform: "zalo", description: "Nhóm hỗ trợ nhanh sau go-live", memberCount: 6, link: "" }
    ],
    docs: [
      { id: "doc_mt1", name: "Hợp đồng dịch vụ vận hành 2026", link: "https://drive.google.com/", type: "contract", addedBy: "Nguyễn Ngọc Anh", updatedAt: "2025-11-01", parentId: null },
      { id: "doc_mt2", name: "Báo cáo go-live", link: "https://docs.google.com/document/", type: "report", addedBy: "Trần Minh Quân", updatedAt: "2026-01-16", parentId: null }
    ],
    changelog: [
      { id: "cl_mt2", date: "2026-01-16", version: "1.0", type: "feature", status: "approved", impact: "high", author: "Trần Minh Quân", featureId: "feat_mt2", title: "Go-live Kế toán & Kho 3 chi nhánh", desc: "Chuyển đổi chính thức, ngừng dùng Excel." },
      { id: "cl_mt1", date: "2025-11-05", version: "0.1", type: "config", status: "approved", impact: "medium", author: "Nguyễn Ngọc Anh", featureId: "", title: "Setup ban đầu", desc: "Khởi tạo company, kho, tài khoản kế toán theo TT200." }
    ],
    notes: [
      { id: "note_mt1", title: "Chu kỳ hỗ trợ", content: "SLA phản hồi trong 4h giờ hành chính theo hợp đồng vận hành.", color: "green", pinned: true, updatedAt: "2026-05-02T10:00" }
    ]
  }
];

/* ── Sample "Kinh nghiệm dự án" posts (for demo) ── */
export const SEED_EXPERIENCE = [
  {
    id: "exp_1", title: "Triển khai CRM cho chuỗi 5 showroom nội thất — bài học từ Nội Thất Xanh",
    category: "casestudy", status: "published",
    description: "Hợp nhất pipeline 5 showroom về 1 hệ thống, import 2.400 khách hàng cũ không trùng lặp, và lý do nên tách Team riêng cho từng showroom thay vì dùng chung 1 Sales Team.",
    content: "<h2>Bối cảnh</h2><p>Dự án <b>Nội Thất Xanh</b> là lần đầu team triển khai CRM cho mô hình bán lẻ đa showroom.</p><h2>Quyết định kiến trúc</h2><ul><li>Mỗi showroom là 1 <code>crm.team</code> riêng, có Team Rule theo khu vực — tránh việc lead rơi lẫn giữa các showroom.</li><li>Import 2.400 khách hàng cũ theo lô 500 bản ghi/lần, chạy rule merge theo SĐT trước khi import để không tạo trùng.</li><li>Demo Pipeline cho quản lý trước khi import dữ liệu thật — giúp phát hiện sớm việc thiếu trường Mã số thuế cho khách B2B.</li></ul><h2>Kết quả</h2><p>Go-live đúng hạn, UAT với cả 5 sales team không phát sinh lỗi nghiêm trọng.</p>",
    tags: ["CRM", "Bán lẻ", "Multi-team", "Odoo 18"],
    author: "Nguyễn Ngọc Anh", projectRef: "Nội Thất Xanh", slug: "trien-khai-crm-chuoi-5-showroom-noi-that",
    views: 482, likes: 37, comments: 9, saves: 44,
    impact: "high", reusable: true, channels: ["web", "newsletter"],
    scheduledAt: null, publishedAt: "2026-06-12", createdAt: "2026-06-10", updatedAt: "2026-06-12"
  },
  {
    id: "exp_2", title: "Vì sao đừng bao giờ để trống Assignment Domain trong Team Rule",
    category: "pitfall", status: "published",
    description: "Lead từ website luôn rơi vào Team mặc định dù đã cấu hình Team Rule theo khu vực — nguyên nhân nằm ở 1 field trống tưởng như vô hại.",
    content: "<h2>Vấn đề</h2><p>Team Rule dùng field <code>Assignment Domain</code> để match lead vào đúng Sales Team theo khu vực. Lead tạo từ form website thường <b>không có sẵn</b> trường được domain filter tới (ví dụ <code>state_id</code>), nên rule không khớp và lead rơi về Team mặc định.</p><h2>Cách xử lý</h2><p>Sửa Assignment Domain để chấp nhận cả trường hợp rỗng (thêm điều kiện OR), hoặc bắt buộc form web nhập Tỉnh/Thành trước khi submit. Nên kiểm tra kỹ mọi Team Rule ngay sau khi cấu hình bằng cách tạo lead test với dữ liệu tối thiểu.</p>",
    tags: ["CRM", "Team Rule", "Lead routing"],
    author: "Trần Minh Quân", projectRef: "Nội Thất Xanh", slug: "dung-de-trong-assignment-domain-team-rule",
    views: 311, likes: 24, comments: 5, saves: 21,
    impact: "high", reusable: true, channels: ["web"],
    scheduledAt: null, publishedAt: "2026-05-24", createdAt: "2026-05-22", updatedAt: "2026-05-24"
  },
  {
    id: "exp_3", title: "Luôn tách quyền người thiết lập chính sách hoa hồng và người chi trả",
    category: "bestpractice", status: "published",
    description: "Nguyên tắc kiểm soát nội bộ đơn giản nhưng hay bị bỏ qua khi setup module Affiliate cho khách hàng lần đầu.",
    content: "<p>Khi cấu hình module <b>Affiliate</b>, rất dễ gán luôn 1 người (thường là chủ chốt) vừa cấu hình chính sách hoa hồng vừa là người duyệt chi trả — tiện cho vận hành ban đầu nhưng tạo lỗ hổng kiểm soát.</p><p>Khuyến nghị: nhóm <b>Quản trị</b> (cấu hình chính sách) và nhóm <b>Quản lý</b> (duyệt chi, xác nhận hoa hồng) nên là 2 người khác nhau ngay từ đầu, kể cả với khách hàng quy mô nhỏ. Chi phí thêm 1 tài khoản thấp hơn nhiều so với rủi ro gian lận nội bộ về sau.</p>",
    tags: ["Affiliate", "Phân quyền", "Kiểm soát nội bộ"],
    author: "Lan Anh", projectRef: "", slug: "tach-quyen-thiet-lap-va-chi-tra-hoa-hong",
    views: 156, likes: 19, comments: 2, saves: 9,
    impact: "medium", reusable: true, channels: ["web"],
    scheduledAt: null, publishedAt: "2026-08-30", createdAt: "2026-08-29", updatedAt: "2026-08-30"
  },
  {
    id: "exp_4", title: "Mẹo tránh trùng lead: luôn check email/SĐT trong 30 ngày trước khi tạo mới",
    category: "tip", status: "published",
    description: "Một rule nhỏ giúp giảm đáng kể lead trùng khi có nhiều nguồn đổ về cùng lúc (website + Facebook Ads + nhập tay).",
    content: "<p>Khi lead vào từ nhiều nguồn cùng lúc, khả năng trùng (cùng email hoặc SĐT trong 30 ngày gần nhất) là rất cao. Bật cảnh báo <code>duplicate lead</code> ngay tại thời điểm tạo, kèm gợi ý merge, giúp Sales không mất công xử lý 2 lần cho cùng 1 khách.</p><p>Nếu có thể, nên đẩy bước check này lên tận API nhận lead từ website thay vì để hệ thống cảnh báo sau khi lead đã tạo — giảm rác dữ liệu ngay từ đầu vào.</p>",
    tags: ["CRM", "Data quality", "Lead"],
    author: "Lan Anh", projectRef: "", slug: "meo-tranh-trung-lead-check-email-sdt",
    views: 203, likes: 15, comments: 3, saves: 6,
    impact: "low", reusable: true, channels: ["web"],
    scheduledAt: null, publishedAt: "2026-05-21", createdAt: "2026-05-20", updatedAt: "2026-05-21"
  },
  {
    id: "exp_5", title: "Đối soát hoa hồng Affiliate: đừng quên bước gán mã Creator thủ công",
    category: "lesson", status: "draft",
    description: "Bước dễ sai nhất trong quy trình Affiliate — nếu khách không đặt qua link/mã giới thiệu, đơn sẽ mất dấu vết Creator.",
    content: "<p>Nháp: ghi lại case thực tế khi vận hành quên gán mã Creator thủ công cho đơn đặt ngoài link giới thiệu, dẫn đến thiếu sót khi tính hoa hồng cuối kỳ. Cần bổ sung checklist đối soát hàng tuần thay vì chỉ dựa vào tự động bắt đơn.</p>",
    tags: ["Affiliate", "Đối soát", "Hoa hồng"],
    author: "", projectRef: "", slug: "doi-soat-hoa-hong-affiliate-gan-ma-thu-cong",
    views: 0, likes: 0, comments: 0, saves: 0,
    impact: "medium", reusable: false, channels: [],
    scheduledAt: null, publishedAt: null, createdAt: "2026-09-01", updatedAt: "2026-09-01"
  },
  {
    id: "exp_6", title: "Go-live Kế toán & Kho cho Dược Phẩm Minh Tâm — 3 chi nhánh, 0 downtime",
    category: "casestudy", status: "scheduled",
    description: "Chuyển đổi từ Excel sang Odoo cho 3 chi nhánh dược phẩm mà không gián đoạn bán hàng ngày nào — quy trình chốt tồn kho đầu kỳ là chìa khoá.",
    content: "<p>Bài đang chờ lên lịch đăng: tổng kết cách chốt tồn kho 3 chi nhánh trước 23h59 để tránh lệch số khi go-live, và lịch hỗ trợ SLA 4h giờ hành chính sau chuyển đổi.</p>",
    tags: ["Kế toán", "Kho", "Go-live", "Dược phẩm"],
    author: "Trần Minh Quân", projectRef: "Dược Phẩm Minh Tâm", slug: "go-live-ke-toan-kho-duoc-pham-minh-tam",
    views: 0, likes: 0, comments: 0, saves: 0,
    impact: "high", reusable: false, channels: ["web", "newsletter"],
    scheduledAt: "2026-09-15T09:00", publishedAt: null, createdAt: "2026-09-05", updatedAt: "2026-09-05"
  },
  {
    id: "exp_7", title: "Reconciliation lệch số vì làm tròn thuế khác nhau giữa hoá đơn và bút toán",
    category: "pitfall", status: "draft",
    description: "Ghi chú nháp về 1 case đối chiếu công nợ bị lệch vài trăm đồng do cấu hình làm tròn thuế không đồng nhất.",
    content: "<p>Đang tổng hợp: khi <code>account.tax</code> có rounding method khác với rounding ở cấp hoá đơn, số tiền reconcile lệch vài đồng dù về bản chất là cùng 1 giao dịch. Cần thống nhất rounding method ở cấp Company trước khi go-live.</p>",
    tags: ["Kế toán", "Reconciliation", "Thuế"],
    author: "", projectRef: "Dược Phẩm Minh Tâm", slug: "reconciliation-lech-so-lam-tron-thue",
    views: 0, likes: 0, comments: 0, saves: 0,
    impact: "medium", reusable: false, channels: [],
    scheduledAt: null, publishedAt: null, createdAt: "2026-09-08", updatedAt: "2026-09-08"
  },
  {
    id: "exp_8", title: "Chuẩn hoá bộ field bắt buộc trước khi import dữ liệu khách hàng cũ",
    category: "bestpractice", status: "published",
    description: "Kinh nghiệm từ đợt import 2.400 khách hàng cũ cho Nội Thất Xanh — chuẩn hoá field trước khi import tiết kiệm rất nhiều thời gian dọn dữ liệu về sau.",
    content: "<h2>Checklist trước khi import</h2><p>Trước khi import dữ liệu khách hàng cũ (thường từ Excel/CRM cũ), nên thống nhất trước:</p><ol><li>Định dạng SĐT duy nhất (không dấu cách/gạch ngang) để rule merge theo SĐT hoạt động đúng</li><li>Bắt buộc có Tỉnh/Thành nếu dùng Team Rule theo khu vực</li><li>Mã số thuế cho nhóm khách B2B, để không phải bổ sung tay sau go-live</li></ol><h2>Kết quả áp dụng</h2><p>Áp dụng bộ chuẩn này trước khi import 2.400 bản ghi cho Nội Thất Xanh giúp giảm đáng kể số ca merge trùng phải xử lý thủ công sau đó.</p>",
    tags: ["Data migration", "Import", "CRM"],
    author: "Lê Thu Hà", projectRef: "Nội Thất Xanh", slug: "chuan-hoa-field-truoc-khi-import-khach-hang-cu",
    views: 264, likes: 21, comments: 4, saves: 14,
    impact: "medium", reusable: true, channels: ["web"],
    scheduledAt: null, publishedAt: "2026-06-06", createdAt: "2026-06-05", updatedAt: "2026-06-06"
  }
];

/* ── Notebooks (top-level containers) ── */
export const SEED_DATA = {
  notebooks: [
    {
      id: "nb_odoo18",
      name: "Odoo 18",
      tech: "odoo18",
      color: "#1F6B40",
      icon: "ti-settings",
      tags: ["ERP", "Odoo", "Backend"],
      description: "Sổ tay nghiên cứu các module chuẩn của Odoo 18 — Sales, Purchase, Inventory, Accounting, CRM, HR.",
      updatedAt: "2026-05-13",
      modules: [SALES, PURCHASE, STOCK, ACCOUNT, CRM, HR, AFFILIATE]
    }
  ]
};

export default SEED_DATA;
